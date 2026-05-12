<?php

namespace App\Listeners;

use App\Events\InterestAccepted;
use App\Models\Notification;

class SendInterestAcceptedNotificationToClient
{
    public function handle(InterestAccepted $event): void
    {
        $interest = $event->interest;

        Notification::create([
            'user_id' => $interest->request->client_id,
            'type' => 'interest_accepted',
            'title' => 'تم اختيار العامل',
            'body' => 'تم اختيار عامل لطلبك',
            'data' => [
                'worker_id' => $interest->worker_id,
            ],
        ]);
    }
}