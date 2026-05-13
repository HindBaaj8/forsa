<?php

namespace App\Http\Controllers;

use App\Models\ServiceRequest;
use App\Models\Interest;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

class WorkerController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Dashboard - إحصائيات المهني
     */
    public function dashboard()
    {
        try {
            $user = Auth::user();
            
            $stats = [
                'totalEarnings' => 0,
                'totalServices' => $user->services()->count(),
                'completedOrders' => $user->ordersAsWorker()->where('status', 'completed')->count(),
                'rating' => $user->rating ?? 0,
            ];
            
            $recentOrders = $user->ordersAsWorker()
                ->with('service', 'client')
                ->latest()
                ->take(5)
                ->get();
                
            $upcomingAppointments = $user->ordersAsWorker()
                ->whereIn('status', ['accepted', 'in_progress'])
                ->with('service', 'client')
                ->get();
            
            return response()->json([
                'stats' => $stats,
                'recentOrders' => $recentOrders,
                'upcomingAppointments' => $upcomingAppointments
            ]);
            
        } catch (\Exception $e) {
            Log::error('Dashboard error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * جلب خدمات المهني
     */
    public function services()
    {
        try {
            $user = Auth::user();
            $services = $user->services()->with('category')->latest()->get();
            
            return response()->json([
                'success' => true,
                'data' => $services
            ]);
            
        } catch (\Exception $e) {
            Log::error('Services error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * جلب طلبات المهني (Orders)
     */
    public function orders()
    {
        try {
            $user = Auth::user();
            $orders = $user->ordersAsWorker()
                ->with('service', 'client')
                ->latest()
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $orders
            ]);
            
        } catch (\Exception $e) {
            Log::error('Orders error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * جلب أرباح المهني
     */
    public function earnings()
    {
        try {
            $user = Auth::user();
            
            $stats = [
                'totalEarnings' => 0,
                'monthlyEarnings' => 0,
                'completedOrders' => $user->ordersAsWorker()->where('status', 'completed')->count(),
                'pendingAmount' => 0,
            ];
            
            $transactions = $user->paymentsAsWorker()
                ->with('order')
                ->latest()
                ->get();
            
            return response()->json([
                'stats' => $stats,
                'transactions' => $transactions
            ]);
            
        } catch (\Exception $e) {
            Log::error('Earnings error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * جلب جدول المواعيد
     */
    public function schedule(Request $request)
    {
        try {
            $user = Auth::user();
            
            $appointments = $user->ordersAsWorker()
                ->whereIn('status', ['accepted', 'in_progress'])
                ->with('service', 'client')
                ->get();
            
            return response()->json([
                'appointments' => $appointments
            ]);
            
        } catch (\Exception $e) {
            Log::error('Schedule error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * تحديث جدول المواعيد
     */
    public function updateSchedule($id, Request $request)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:available,busy,away'
            ]);
            
            return response()->json(['success' => true]);
            
        } catch (\Exception $e) {
            Log::error('Update schedule error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * جلب ملف المهني الشخصي
     */
    public function profile()
    {
        try {
            return response()->json(Auth::user());
            
        } catch (\Exception $e) {
            Log::error('Profile error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * تحديث ملف المهني الشخصي
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = Auth::user();
            
            $validated = $request->validate([
                'first_name' => 'sometimes|string|max:255',
                'last_name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20',
                'city' => 'sometimes|string|max:255',
                'bio' => 'nullable|string|max:1000',
                'avatar' => 'nullable|image|max:2048',
            ]);
            
            if ($request->hasFile('avatar')) {
                $path = $request->file('avatar')->store('avatars', 'public');
                $validated['avatar'] = $path;
            }
            
            $user->update($validated);
            
            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'Profile updated successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Update profile error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * تحديث إعدادات الإشعارات
     */
    public function updateNotifications(Request $request)
    {
        try {
            $validated = $request->validate([
                'new_orders' => 'boolean',
                'messages' => 'boolean',
                'newsletter' => 'boolean',
            ]);
            
            return response()->json([
                'success' => true,
                'data' => $validated
            ]);
            
        } catch (\Exception $e) {
            Log::error('Update notifications error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * قبول طلب (Order)
     */
    public function acceptOrder($orderId)
    {
        try {
            $user = Auth::user();
            $order = \App\Models\Order::findOrFail($orderId);
            
            if ($order->worker_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            
            $order->update(['status' => 'accepted']);
            
            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Order accepted'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Accept order error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * رفض طلب (Order)
     */
    public function rejectOrder($orderId)
    {
        try {
            $user = Auth::user();
            $order = \App\Models\Order::findOrFail($orderId);
            
            if ($order->worker_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            
            $order->update(['status' => 'rejected']);
            
            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Order rejected'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Reject order error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * بدء العمل على طلب
     */
    public function startOrder($orderId)
    {
        try {
            $user = Auth::user();
            $order = \App\Models\Order::findOrFail($orderId);
            
            if ($order->worker_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            
            $order->update(['status' => 'in_progress']);
            
            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Work started'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Start order error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * إكمال الطلب
     */
    public function completeOrder($orderId)
    {
        try {
            $user = Auth::user();
            $order = \App\Models\Order::findOrFail($orderId);
            
            if ($order->worker_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            
            $order->update(['status' => 'completed']);
            
            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Order completed'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Complete order error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * 🔥 جلب الطلبات المتاحة للمهني (طلبات العملاء)
     */
    public function getAvailableRequests()
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'worker') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - Worker only'
                ], 403);
            }
            
            $requests = ServiceRequest::with(['client', 'category'])
                ->where('status', 'pending')
                ->latest()
                ->get();
            
            foreach ($requests as $request) {
                $hasOffer = Interest::where('request_id', $request->id)
                    ->where('worker_id', $user->id)
                    ->exists();
                $request->has_offer = $hasOffer;
            }
            
            return response()->json([
                'success' => true,
                'data' => $requests,
                'total' => $requests->count()
            ]);
            
        } catch (\Exception $e) {
            Log::error('getAvailableRequests error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔥 قبول طلب من عميل (Request)
     */
    public function acceptRequest($requestId)
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'worker') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            
            $serviceRequest = ServiceRequest::findOrFail($requestId);
            
            if ($serviceRequest->status !== 'pending') {
                return response()->json(['message' => 'Request cannot be accepted'], 400);
            }
            
            $interest = Interest::create([
                'request_id' => $serviceRequest->id,
                'worker_id' => $user->id,
                'status' => 'pending',
                'message' => 'I would like to work on this request'
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Request accepted successfully',
                'data' => $interest
            ]);
            
        } catch (\Exception $e) {
            Log::error('acceptRequest error: ' . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * 🔥 رفض طلب من عميل (Request)
     */
    public function rejectRequest($requestId)
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'worker') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            
            $serviceRequest = ServiceRequest::findOrFail($requestId);
            
            Interest::where('request_id', $serviceRequest->id)
                ->where('worker_id', $user->id)
                ->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Request rejected'
            ]);
            
        } catch (\Exception $e) {
            Log::error('rejectRequest error: ' . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * 🔥 تقديم عرض على طلب مع إرسال إشعار للعميل
     */
    public function submitOffer(Request $request, $requestId)
    {
        try {
            $validated = $request->validate([
                'price' => 'required|numeric|min:0',
                'duration' => 'required|string|max:255',
                'message' => 'nullable|string'
            ]);
            
            $user = Auth::user();
            
            if ($user->role !== 'worker') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            
            $serviceRequest = ServiceRequest::findOrFail($requestId);
            
            if ($serviceRequest->status !== 'pending') {
                return response()->json(['message' => 'Request is no longer available'], 400);
            }
            
            // إنشاء أو تحديث العرض
            $interest = Interest::updateOrCreate(
                [
                    'request_id' => $serviceRequest->id,
                    'worker_id' => $user->id
                ],
                [
                    'price' => $validated['price'],
                    'duration' => $validated['duration'],
                    'message' => $validated['message'] ?? null,
                    'status' => 'pending'
                ]
            );
            
            // 🔥🔥🔥 إنشاء إشعار للعميل 🔥🔥🔥
            Notification::create([
                'user_id' => $serviceRequest->client_id,
                'type' => 'worker_applied',
                'title' => '📢 عامل مهتم بخدمتك',
                'message' => "🔧 العامل {$user->first_name} {$user->last_name} قدم عرضاً لطلبك: {$serviceRequest->title} - {$validated['price']} درهم",
                'data' => json_encode([
                    'request_id' => $serviceRequest->id,
                    'worker_id' => $user->id,
                    'worker_name' => $user->first_name . ' ' . $user->last_name,
                    'price' => $validated['price'],
                    'duration' => $validated['duration'],
                    'offer_message' => $validated['message'] ?? null
                ]),
                'link' => '/client/requests',
                'is_read' => false
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Offer submitted successfully',
                'data' => $interest,
                'request_id' => $requestId
            ]);
            
        } catch (\Exception $e) {
            Log::error('submitOffer error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}