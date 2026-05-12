<?php

namespace App\Listeners;

use App\Events\OrderStarted;
use App\Models\Notification;

class SendOrderStartedNotification
{
    public function handle(OrderStarted $event): void
    {
        $order = $event->order;

        Notification::create([
            'user_id' => $order->client_id,
            'type' => 'order_started',
            'title' => 'بدأ العمل',
            'body' => 'تم بدء تنفيذ طلبك',
            'data' => ['order_id' => $order->id],
        ]);
    }
}