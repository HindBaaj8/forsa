<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Order;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ConversationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Get all conversations for authenticated user
     */
public function index()
{
    try {
        $userId = auth()->id();
        
        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        \Log::info('User ID: ' . $userId);

        $conversations = Conversation::where('client_id', $userId)
            ->orWhere('worker_id', $userId)
            ->with(['client', 'worker', 'order'])
            ->latest('last_message_at')
            ->get();

        \Log::info('Conversations count: ' . $conversations->count());

        $formatted = $conversations->map(function($conv) use ($userId) {
            try {
                $isClient = $conv->client_id === $userId;
                $participant = $isClient ? $conv->worker : $conv->client;
                
                $unreadCount = 0;
                if ($participant) {
                    $unreadCount = Message::where('conversation_id', $conv->id)
                        ->where('sender_id', $participant->id)
                        ->where('is_read', false)
                        ->count();
                }
                
                return [
                    'id' => $conv->id,
                    'participant' => $participant ? [
                        'id' => $participant->id,
                        'name' => $participant->first_name . ' ' . $participant->last_name,
                        'avatar' => $participant->avatar,
                        'role' => $participant->role,
                    ] : null,
                    'order_id' => $conv->order_id,
                    'last_message' => $conv->last_message_at ? 'Dernier message' : null,
                    'last_message_at' => $conv->last_message_at,
                    'unread_count' => $unreadCount,
                    'created_at' => $conv->created_at,
                ];
            } catch (\Exception $e) {
                \Log::error('Error formatting conversation: ' . $e->getMessage());
                return null;
            }
        })->filter();

        return response()->json([
            'success' => true,
            'data' => $formatted
        ]);
        
    } catch (\Exception $e) {
        \Log::error('Conversations index error: ' . $e->getMessage());
        \Log::error('Stack trace: ' . $e->getTraceAsString());
        return response()->json([
            'success' => false,
            'message' => 'Server error: ' . $e->getMessage(),
            'data' => []
        ], 500);
    }
}
    public function getOrCreateConversation(Order $order): Conversation
    {
        $conversation = Conversation::where('client_id', $order->client_id)
            ->where('worker_id', $order->worker_id)
            ->where('order_id', $order->id)
            ->first();
        
        if ($conversation) {
            return $conversation;
        }
        
        return Conversation::create([
            'client_id' => $order->client_id,
            'worker_id' => $order->worker_id,
            'order_id' => $order->id,
        ]);
    }

    /**
     * Get single conversation
     */
    public function show(Conversation $conversation)
    {
        try {
            $userId = auth()->id();
            
            if (!in_array($userId, [$conversation->client_id, $conversation->worker_id])) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $conversation->load(['client', 'worker', 'messages' => function($q) {
                    $q->latest()->limit(50);
                }])
            ]);
        } catch (\Exception $e) {
            Log::error('Show conversation error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Get conversation by order
     */
    public function getByOrder(Order $order)
    {
        try {
            $userId = auth()->id();
            
            if (!in_array($userId, [$order->client_id, $order->worker_id])) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $conversation = Conversation::firstOrCreate([
                'client_id' => $order->client_id,
                'worker_id' => $order->worker_id,
                'order_id' => $order->id,
            ]);
            
            return response()->json([
                'success' => true,
                'data' => $conversation->load(['client', 'worker'])
            ]);
        } catch (\Exception $e) {
            Log::error('GetByOrder error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * ✅ Create a new conversation (for direct messaging)
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'worker_id' => 'required|exists:users,id'
            ]);
            
            $workerId = $validated['worker_id'];
            $clientId = auth()->id();
            
            // تأكد من أن المستخدم الآخر هو worker
            $worker = User::findOrFail($workerId);
            if ($worker->role !== 'worker') {
                return response()->json(['message' => 'Invalid worker'], 422);
            }
            
            // منع المحادثة مع النفس
            if ($clientId == $workerId) {
                return response()->json(['message' => 'Cannot start conversation with yourself'], 422);
            }
            
            // إنشاء محادثة جديدة أو جلب الموجودة
            $conversation = Conversation::firstOrCreate([
                'client_id' => $clientId,
                'worker_id' => $workerId,
                'order_id' => null,
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Conversation created successfully',
                'data' => $conversation->load(['client', 'worker'])
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Store conversation error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }
}