<?php

namespace App\Listeners;

use App\Events\OrderCompleted;
use App\Models\Notification;

class SendOrderCompletedNotification
{
    public function handle(OrderCompleted $event): void
    {
        $order = $event->order;

        Notification::create([
            'user_id' => $order->client_id,
            'type' => 'order_completed',
            'title' => 'تم إكمال الطلب',
            'body' => 'تم إنهاء الخدمة بنجاح',
            'data' => ['order_id' => $order->id],
        ]);
    }
}