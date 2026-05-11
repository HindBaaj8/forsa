<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Request;
use App\Events\DataUpdated;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    // جلب طلبات العامل (اللي وصلولو)
    public function workerOrders(HttpRequest $request)
    {
        $orders = Order::with(['request', 'client', 'service'])
            ->where('worker_id', $request->user()->id)
            ->latest()
            ->paginate(20);
            
        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }
    public function schedule(HttpRequest $request)
{
    $user = $request->user();

    $date = $request->query('date');
    $view = $request->query('view');

    $query = Order::with(['client', 'service'])
        ->where('worker_id', $user->id);

    // فلترة حسب التاريخ
    if ($date) {
        $query->whereDate('created_at', $date);
    }

    // فلترة حسب الحالة
    if ($view === 'upcoming') {
        $query->whereIn('status', ['pending', 'accepted', 'in_progress']);
    }

    $orders = $query->latest()->get();

    return response()->json([
        'status' => 'success',
        'data' => $orders
    ]);
}
    // قبول الطلب (العامل يقبل الخدمة)
    public function accept(HttpRequest $request, $id)
    {
        $order = Order::findOrFail($id);
        
        if ($order->worker_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $oldStatus = $order->status;
        $order->status = 'accepted';
        $order->save();
        
        // تحديث حالة الطلب المرتبط
        $order->request->status = 'active';
        $order->request->save();
        
        // ✅ إشعار للعميل صاحب الطلب
        broadcast(new DataUpdated(
            $order->client_id,
            'order_accepted',
            'تم قبول طلبك رقم ' . $order->request_id . ' من قبل العامل',
            $order
        ));
        
        // ✅ إشعار للعامل
        broadcast(new DataUpdated(
            $request->user()->id,
            'order_updated',
            'تم قبول الطلب رقم ' . $order->request_id . ' بنجاح',
            $order
        ));
        
        return response()->json([
            'status' => 'success',
            'message' => 'Order accepted successfully',
            'data' => $order
        ]);
    }
    
    // بدء العمل على الطلب
    public function startWork(HttpRequest $request, $id)
    {
        $order = Order::findOrFail($id);
        
        if ($order->worker_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $order->status = 'in_progress';
        $order->save();
        
        $order->request->status = 'in_progress';
        $order->request->save();
        
        // ✅ إشعار للعميل
        broadcast(new DataUpdated(
            $order->client_id,
            'order_started',
            'تم بدء العمل على طلبك رقم ' . $order->request_id,
            $order
        ));
        
        // ✅ إشعار للعامل
        broadcast(new DataUpdated(
            $request->user()->id,
            'order_updated',
            'تم بدء العمل على الطلب رقم ' . $order->request_id,
            $order
        ));
        
        return response()->json([
            'status' => 'success',
            'message' => 'Work started',
            'data' => $order
        ]);
    }
    
    // إكمال الطلب
    public function complete(HttpRequest $request, $id)
    {
        $order = Order::findOrFail($id);
        
        if ($order->worker_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $order->status = 'completed';
        $order->save();
        
        $order->request->status = 'completed';
        $order->request->save();
        
        // ✅ إشعار للعميل
        broadcast(new DataUpdated(
            $order->client_id,
            'order_completed',
            'تم إكمال طلبك رقم ' . $order->request_id . ' بنجاح 🎉',
            $order
        ));
        
        // ✅ إشعار للعامل
        broadcast(new DataUpdated(
            $request->user()->id,
            'order_completed',
            'تم إكمال الطلب رقم ' . $order->request_id . ' والأرباح ستضاف إلى حسابك',
            $order
        ));
        
        // ✅ إشعار بتحديث الأرباح
        broadcast(new DataUpdated(
            $request->user()->id,
            'earnings_updated',
            'تم إضافة ' . $order->price . ' درهم إلى أرباحك',
            ['order_id' => $order->id, 'amount' => $order->price]
        ));
        
        return response()->json([
            'status' => 'success',
            'message' => 'Order completed successfully',
            'data' => $order
        ]);
    }
    
    // إلغاء الطلب
    public function cancel(HttpRequest $request, $id)
    {
        $order = Order::findOrFail($id);
        
        if ($order->worker_id !== $request->user()->id && $order->client_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $order->status = 'cancelled';
        $order->save();
        
        $order->request->status = 'cancelled';
        $order->request->save();
        
        // ✅ تحديد الجهة اللي ستستلم الإشعار
        $receiverId = ($request->user()->id === $order->client_id) 
            ? $order->worker_id 
            : $order->client_id;
        
        // ✅ إشعار للطرف الآخر
        if ($receiverId) {
            broadcast(new DataUpdated(
                $receiverId,
                'order_cancelled',
                'تم إلغاء الطلب رقم ' . $order->request_id,
                $order
            ));
        }
        
        // ✅ إشعار للمستخدم نفسه
        broadcast(new DataUpdated(
            $request->user()->id,
            'order_cancelled',
            'تم إلغاء الطلب رقم ' . $order->request_id . ' بنجاح',
            $order
        ));
        
        return response()->json([
            'status' => 'success',
            'message' => 'Order cancelled',
            'data' => $order
        ]);
    }
}