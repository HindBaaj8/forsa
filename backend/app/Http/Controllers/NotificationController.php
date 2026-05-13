<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * جلب جميع الإشعارات للمستخدم الحالي
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }
            
            $query = Notification::where('user_id', $user->id)
                ->orderBy('created_at', 'desc');
            
            if ($request->has('limit')) {
                $query->limit($request->limit);
            }
            
            $notifications = $query->paginate(20);
            
            return response()->json([
                'success' => true,
                'data' => $notifications->items(),
                'meta' => [
                    'current_page' => $notifications->currentPage(),
                    'last_page' => $notifications->lastPage(),
                    'per_page' => $notifications->perPage(),
                    'total' => $notifications->total(),
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Notifications index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * جلب عدد الإشعارات غير المقروءة
     */
    public function unreadCount()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['count' => 0]);
            }
            
            $count = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();
            
            return response()->json([
                'count' => $count
            ]);
            
        } catch (\Exception $e) {
            Log::error('Unread count error: ' . $e->getMessage());
            return response()->json(['count' => 0], 200);
        }
    }

    /**
     * تحديث إشعار كمقروء
     */
    public function markAsRead($id)
    {
        try {
            $user = Auth::user();
            
            $notification = Notification::where('user_id', $user->id)
                ->where('id', $id)
                ->first();
            
            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification not found'
                ], 404);
            }
            
            $notification->update(['is_read' => true]);
            
            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Mark as read error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error'
            ], 500);
        }
    }

    /**
     * تحديث جميع الإشعارات كمقروءة
     */
    public function markAllAsRead()
    {
        try {
            $user = Auth::user();
            
            Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->update(['is_read' => true]);
            
            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Mark all as read error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error'
            ], 500);
        }
    }

    /**
     * حذف إشعار
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            
            $notification = Notification::where('user_id', $user->id)
                ->where('id', $id)
                ->first();
            
            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification not found'
                ], 404);
            }
            
            $notification->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Notification deleted'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Delete notification error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Server error'
            ], 500);
        }
    }
}