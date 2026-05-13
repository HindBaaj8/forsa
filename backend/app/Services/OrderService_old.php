<?php

namespace App\Services;

use App\Models\Interest;
use App\Models\Order;
use App\Models\Conversation;

class OrderService
{
    public function createOrderFromInterest(Interest $interest): Order
    {
        $request = $interest->request;
        
        $order = Order::create([
            'request_id' => $request->id,
            'client_id' => $request->client_id,
            'worker_id' => $interest->worker_id,
            'agreed_price' => $request->budget,
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);
        
        $request->update(['status' => 'in_discussion']);
        $interest->update(['status' => 'accepted']);
        
        // Reject other interests
        Interest::where('request_id', $request->id)
            ->where('id', '!=', $interest->id)
            ->where('status', 'pending')
            ->update(['status' => 'rejected']);
        
        // Create conversation
        Conversation::create([
            'client_id' => $request->client_id,
            'worker_id' => $interest->worker_id,
            'order_id' => $order->id,
        ]);
        
        return $order;
    }
}