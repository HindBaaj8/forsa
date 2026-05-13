<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Interest;
use App\Models\ServiceRequest;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class OrderService
{
    /**
     * إنشاء طلب جديد من الـ Interest
     */
    public function createOrderFromInterest(Interest $interest)
    {
        $serviceRequest = ServiceRequest::find($interest->request_id);
        
        $order = Order::create([
            'request_id' => $serviceRequest->id,
            'client_id' => $serviceRequest->client_id,
            'worker_id' => $interest->worker_id,
            'service_id' => $serviceRequest->category_id,
            'agreed_price' => $interest->price,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);
        
        // إنشاء إشعار للعميل
        Notification::create([
            'user_id' => $serviceRequest->client_id,
            'type' => 'order_created',
            'title' => 'طلب جديد',
            'message' => "تم إنشاء طلب جديد رقم #{$order->id}",
            'data' => json_encode(['order_id' => $order->id]),
            'is_read' => false,
        ]);
        
        // تحديث حالة الـ request
        $serviceRequest->update(['status' => 'in_discussion']);
        
        return $order;
    }
    
    /**
     * تحديث حالة الطلب
     */
    public function updateOrderStatus(Order $order, string $status)
    {
        $order->update(['status' => $status]);
        
        // إشعار للعميل
        $user_id = ($status === 'completed') ? $order->client_id : $order->worker_id;
        
        Notification::create([
            'user_id' => $user_id,
            'type' => 'order_status',
            'title' => 'تحديث حالة الطلب',
            'message' => "تم تحديث حالة الطلب رقم #{$order->id} إلى: {$status}",
            'data' => json_encode(['order_id' => $order->id, 'status' => $status]),
            'is_read' => false,
        ]);
        
        return $order;
    }
}