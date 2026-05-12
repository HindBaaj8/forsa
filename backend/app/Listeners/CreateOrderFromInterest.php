<?php

namespace App\Listeners;

use App\Events\InterestAccepted;
use App\Models\Order;

class CreateOrderFromInterest
{
    public function handle(InterestAccepted $event): void
    {
        $interest = $event->interest;

        Order::create([
            'request_id' => $interest->request_id,
            'client_id' => $interest->request->client_id,
            'worker_id' => $interest->worker_id,
            'agreed_price' => $interest->request->budget,
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);
    }
}