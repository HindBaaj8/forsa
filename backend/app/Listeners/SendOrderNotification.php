<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Models\Notification;

class SendOrderNotification
{
    public function handle(OrderCreated $event): void
    {
        $order = $event->order;

        Notification::create([
            'user_id' => $order->client_id,
            'type' => 'order_created',
            'title' => 'تم إنشاء الطلب',
            'body' => 'تم إنشاء طلبك بنجاح',
            'data' => [
                'order_id' => $order->id,
            ],
        ]);

        Notification::create([
            'user_id' => $order->worker_id,
            'type' => 'order_created',
            'title' => 'طلب جديد',
            'body' => 'لديك طلب جديد في انتظارك',
            'data' => [
                'order_id' => $order->id,
            ],
        ]);
    }
}