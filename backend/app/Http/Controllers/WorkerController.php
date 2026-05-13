<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Order;
use App\Models\User;
use App\Models\Interest;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class WorkerController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:worker');
    }

    /**
     * Dashboard - Statistiques principales
     */
    public function dashboard()
    {
        $userId = auth()->id();
        
        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        try {
            $totalEarnings = (float) Order::where('worker_id', $userId)
                ->where('status', 'completed')
                ->sum('agreed_price');

            $monthlyEarnings = (float) Order::where('worker_id', $userId)
                ->where('status', 'completed')
                ->where('completed_at', '>=', now()->startOfMonth())
                ->sum('agreed_price');

            $stats = [
                'totalEarnings' => $totalEarnings,
                'monthlyEarnings' => $monthlyEarnings,
                'totalServices' => Service::where('worker_id', $userId)->count(),
                'completedOrders' => Order::where('worker_id', $userId)
                    ->where('status', 'completed')
                    ->count(),
                'pendingOrders' => Order::where('worker_id', $userId)
                    ->where('status', 'pending_acceptance')
                    ->count(),
                'rating' => auth()->user()->rating ?? 0,
                'totalReviews' => auth()->user()->total_reviews ?? 0,
            ];

            $recentOrders = Order::where('worker_id', $userId)
                ->with('client', 'request')
                ->latest()
                ->take(5)
                ->get()
                ->map(function($order) {
                    return [
                        'id' => $order->id,
                        'client_name' => $order->client->first_name . ' ' . $order->client->last_name,
                        'service_name' => $order->request->title,
                        'price' => $order->agreed_price,
                        'status' => $order->status,
                        'created_at' => $order->created_at->format('Y-m-d'),
                    ];
                });

            $upcomingAppointments = [];

            return response()->json([
                'success' => true,
                'stats' => $stats,
                'recentOrders' => $recentOrders,
                'upcomingAppointments' => $upcomingAppointments,
            ]);
        } catch (\Exception $e) {
            \Log::error('Worker dashboard error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Liste des services du worker
     */
    public function services(Request $request)
    {
        try {
            $services = Service::where('worker_id', auth()->id())
                ->with('category')
                ->latest()
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $services
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Créer un nouveau service
     */
    public function storeService(Request $request)
    {
        try {
            $validated = $request->validate([
                'category_id' => 'required|exists:categories,id',
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'location' => 'required|string',
            ]);

            $service = Service::create([
                'worker_id' => auth()->id(),
                'category_id' => $validated['category_id'],
                'title' => $validated['title'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'location' => $validated['location'],
                'approval_status' => 'pending',
                'is_active' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Service created successfully',
                'data' => $service
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Mettre à jour un service
     */
    public function updateService(Request $request, Service $service)
    {
        if ($service->worker_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'price' => 'sometimes|numeric|min:0',
                'location' => 'sometimes|string',
                'is_active' => 'sometimes|boolean',
            ]);

            $service->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Service updated successfully',
                'data' => $service
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Supprimer un service
     */
    public function deleteService(Service $service)
    {
        if ($service->worker_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $service->delete();
            return response()->json(['success' => true, 'message' => 'Service deleted']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Activer/Désactiver un service
     */
    public function toggleService(Service $service)
    {
        if ($service->worker_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $service->update(['is_active' => !$service->is_active]);
            return response()->json([
                'success' => true,
                'message' => 'Service toggled',
                'data' => $service
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Liste des commandes du worker
     */
    public function orders(Request $request)
    {
        try {
            $orders = Order::where('worker_id', auth()->id())
                ->with(['client', 'request', 'conversation'])
                ->latest()
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Accepter une commande
     */
    public function acceptOrder(Order $order)
    {
        if ($order->worker_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->status !== 'pending_acceptance') {
            return response()->json(['message' => 'Order cannot be accepted'], 400);
        }

        try {
            $order->update([
                'status' => 'accepted',
                'accepted_at' => now(),
            ]);

            // Créer une notification pour le client
            Notification::create([
                'user_id' => $order->client_id,
                'type' => 'order_accepted',
                'title' => 'Commande acceptée',
                'body' => 'Votre commande a été acceptée par le professionnel',
                'data' => json_encode(['order_id' => $order->id]),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order accepted',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Refuser une commande
     */
    public function rejectOrder(Order $order)
    {
        if ($order->worker_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $order->update(['status' => 'cancelled']);
            
            // Remettre la demande en attente
            $order->request->update(['status' => 'pending']);

            // Créer une notification pour le client
            Notification::create([
                'user_id' => $order->client_id,
                'type' => 'order_rejected',
                'title' => 'Commande refusée',
                'body' => 'Votre commande a été refusée par le professionnel',
                'data' => json_encode(['order_id' => $order->id]),
            ]);

            return response()->json(['success' => true, 'message' => 'Order rejected']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Démarrer le travail sur une commande
     */
    public function startOrder(Order $order)
    {
        if ($order->worker_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->status !== 'accepted') {
            return response()->json(['message' => 'Order cannot be started'], 400);
        }

        try {
            $order->update([
                'status' => 'in_progress',
                'started_at' => now(),
            ]);

            Notification::create([
                'user_id' => $order->client_id,
                'type' => 'order_started',
                'title' => 'Travail commencé',
                'body' => 'Le professionnel a commencé à travailler sur votre commande',
                'data' => json_encode(['order_id' => $order->id]),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Work started',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Terminer une commande
     */
    public function completeOrder(Order $order)
    {
        if ($order->worker_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->status !== 'in_progress') {
            return response()->json(['message' => 'Order cannot be completed'], 400);
        }

        try {
            $order->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            $order->request->update(['status' => 'completed']);

            Notification::create([
                'user_id' => $order->client_id,
                'type' => 'order_completed',
                'title' => 'Commande terminée',
                'body' => 'Votre commande a été complétée avec succès',
                'data' => json_encode(['order_id' => $order->id]),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Work completed',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Annuler une commande
     */
    public function cancelOrder(Order $order)
    {
        if ($order->worker_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!in_array($order->status, ['pending_acceptance', 'accepted'])) {
            return response()->json(['message' => 'Order cannot be cancelled'], 400);
        }

        try {
            $order->update(['status' => 'cancelled']);
            $order->request->update(['status' => 'pending']);

            return response()->json(['success' => true, 'message' => 'Order cancelled']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Statistiques des gains
     */
    public function earnings()
    {
        try {
            $userId = auth()->id();

            $completedOrders = Order::where('worker_id', $userId)
                ->where('status', 'completed')
                ->get();

            $pendingOrders = Order::where('worker_id', $userId)
                ->where('status', 'in_progress')
                ->get();

            $stats = [
                'totalEarnings' => (float) $completedOrders->sum('agreed_price'),
                'monthlyEarnings' => (float) $completedOrders
                    ->where('completed_at', '>=', now()->startOfMonth())
                    ->sum('agreed_price'),
                'completedOrders' => $completedOrders->count(),
                'pendingAmount' => (float) $pendingOrders->sum('agreed_price'),
            ];

            $transactions = $completedOrders->map(function($order) {
                return [
                    'id' => $order->id,
                    'date' => $order->completed_at->format('Y-m-d'),
                    'service_name' => $order->request->title,
                    'client_name' => $order->client->first_name . ' ' . $order->client->last_name,
                    'amount' => $order->agreed_price,
                    'status' => 'completed',
                ];
            });

            return response()->json([
                'success' => true,
                'stats' => $stats,
                'transactions' => $transactions,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Liste des conversations
     */
    public function conversations()
    {
        try {
            $userId = auth()->id();
            
            $conversations = Conversation::where('worker_id', $userId)
                ->with(['client', 'order'])
                ->latest('last_message_at')
                ->get()
                ->map(function($conv) use ($userId) {
                    $unreadCount = Message::where('conversation_id', $conv->id)
                        ->where('sender_id', $conv->client_id)
                        ->where('is_read', false)
                        ->count();

                    return [
                        'id' => $conv->id,
                        'participant' => [
                            'id' => $conv->client->id,
                            'name' => $conv->client->first_name . ' ' . $conv->client->last_name,
                            'avatar' => $conv->client->avatar,
                            'role' => 'client',
                        ],
                        'last_message' => $conv->last_message_at ? 'Dernier message' : null,
                        'last_message_at' => $conv->last_message_at,
                        'unread_count' => $unreadCount,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $conversations
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Messages d'une conversation
     */
    public function conversationMessages($conversationId)
    {
        try {
            $conversation = Conversation::findOrFail($conversationId);

            if ($conversation->worker_id !== auth()->id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $messages = Message::where('conversation_id', $conversationId)
                ->with('sender')
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function($msg) {
                    return [
                        'id' => $msg->id,
                        'message' => $msg->message,
                        'sender_id' => $msg->sender_id,
                        'is_me' => $msg->sender_id === auth()->id(),
                        'is_read' => $msg->is_read,
                        'created_at' => $msg->created_at,
                    ];
                });

            // Marquer les messages comme lus
            Message::where('conversation_id', $conversationId)
                ->where('sender_id', '!=', auth()->id())
                ->where('is_read', false)
                ->update(['is_read' => true, 'read_at' => now()]);

            return response()->json([
                'success' => true,
                'data' => $messages
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Envoyer un message
     */
    public function sendMessage(Request $request, $conversationId)
    {
        try {
            $conversation = Conversation::findOrFail($conversationId);

            if ($conversation->worker_id !== auth()->id()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $validated = $request->validate([
                'message' => 'required|string|max:1000',
            ]);

            $message = Message::create([
                'conversation_id' => $conversationId,
                'sender_id' => auth()->id(),
                'message' => $validated['message'],
                'type' => 'text',
            ]);

            $conversation->update(['last_message_at' => now()]);

            return response()->json([
                'success' => true,
                'data' => $message
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Emploi du temps / planning
     */
    public function schedule(Request $request)
    {
        try {
            // À implémenter avec une table appointments
            $appointments = [];

            return response()->json([
                'success' => true,
                'appointments' => $appointments,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Mettre à jour un rendez-vous
     */
    public function updateScheduleStatus($id, Request $request)
    {
        try {
            // À implémenter avec une table appointments
            return response()->json(['success' => true, 'message' => 'Schedule updated']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Profil du worker
     */
    public function profile()
    {
        try {
            $user = auth()->user();
            return response()->json([
                'success' => true,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Mettre à jour le profil
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $validated = $request->validate([
                'first_name' => 'nullable|string|max:255',
                'last_name' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:20',
                'city' => 'nullable|string|max:255',
                'profession' => 'nullable|string|max:255',
                'experience' => 'nullable|integer|min:0',
                'bio' => 'nullable|string|max:1000',
            ]);

            // Gestion de l'avatar
            if ($request->hasFile('avatar')) {
                if ($user->avatar) {
                    Storage::disk('public')->delete($user->avatar);
                }
                $path = $request->file('avatar')->store('avatars', 'public');
                $validated['avatar'] = $path;
            }

            $user->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $user
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Changer le mot de passe
     */
    public function changePassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            $user = auth()->user();

            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['message' => 'Current password is incorrect'], 422);
            }

            $user->update([
                'password' => Hash::make($validated['new_password']),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Mettre à jour les préférences de notifications
     */
    public function updateNotifications(Request $request)
    {
        try {
            $validated = $request->validate([
                'new_orders' => 'boolean',
                'messages' => 'boolean',
                'newsletter' => 'boolean',
            ]);

            // Stocker dans les paramètres utilisateur
            $user = auth()->user();
            $settings = json_decode($user->settings ?? '{}', true);
            $settings['notifications'] = $validated;
            $user->update(['settings' => json_encode($settings)]);

            return response()->json([
                'success' => true,
                'message' => 'Notifications updated',
                'data' => $validated
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Nombre de messages non lus
     */
    public function unreadCount()
    {
        try {
            $count = Conversation::where('worker_id', auth()->id())
                ->whereHas('messages', function($q) {
                    $q->where('is_read', false)
                      ->where('sender_id', '!=', auth()->id());
                })
                ->count();

            return response()->json(['success' => true, 'count' => $count]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Statistiques des avis
     */
    public function reviews()
    {
        try {
            $reviews = DB::table('reviews')
                ->where('worker_id', auth()->id())
                ->latest()
                ->paginate(10);

            $average = DB::table('reviews')
                ->where('worker_id', auth()->id())
                ->avg('rating');

            return response()->json([
                'success' => true,
                'reviews' => $reviews,
                'average_rating' => round($average, 1),
                'total_reviews' => $reviews->total(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }
}