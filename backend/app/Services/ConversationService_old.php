<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Order;

class ConversationService
{
    public function getOrCreateConversation(Order $order): Conversation
    {
        $conversation = Conversation::where('client_id', $order->client_id)
            ->where('worker_id', $order->worker_id)
            ->where('order_id', $order->id)
            ->first();
        
        if ($conversation) {
            return $conversation;
        }
        
        return Conversation::create([
            'client_id' => $order->client_id,
            'worker_id' => $order->worker_id,
            'order_id' => $order->id,
        ]);
    }
}