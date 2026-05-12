<?php

namespace App\Listeners;

use App\Events\InterestAccepted;
use App\Models\Conversation;

class CreateConversationFromInterest
{
    public function handle(InterestAccepted $event): void
    {
        $interest = $event->interest;

        Conversation::firstOrCreate([
            'client_id' => $interest->request->client_id,
            'worker_id' => $interest->worker_id,
            'order_id' => $interest->request->order->id ?? null,
        ]);
    }
}