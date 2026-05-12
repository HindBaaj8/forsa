<?php

namespace App\Listeners;

use App\Events\InterestAccepted;
use App\Models\Notification;

class SendInterestAcceptedNotification
{
    public function handle(InterestAccepted $event): void
    {
        $interest = $event->interest;

        Notification::create([
            'user_id' => $interest->worker_id,
            'type' => 'interest_accepted',
            'title' => 'تم قبول عرضك',
            'body' => 'تم قبول عرضك على الطلب',
            'data' => [
                'request_id' => $interest->request_id,
            ],
        ]);
    }
}