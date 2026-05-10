<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Request;
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
        
        $order->status = 'accepted';
        $order->save();
        
        // تحديث حالة الطلب المرتبط
        $order->request->status = 'active';
        $order->request->save();
        
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
        
        return response()->json([
            'status' => 'success',
            'message' => 'Order cancelled',
            'data' => $order
        ]);
    }
}