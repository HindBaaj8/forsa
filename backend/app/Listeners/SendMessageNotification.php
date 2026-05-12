<?php

namespace App\Listeners;

use App\Events\MessageSent;
use App\Models\Notification;

class SendMessageNotification
{
    public function handle(MessageSent $event): void
    {
        $message = $event->message;
        $conversation = $message->conversation;

        $receiverId = $message->sender_id === $conversation->client_id
            ? $conversation->worker_id
            : $conversation->client_id;

        Notification::create([
            'user_id' => $receiverId,
            'type' => 'message_received',
            'title' => 'رسالة جديدة',
            'body' => 'وصلتك رسالة جديدة',
            'data' => [
                'conversation_id' => $conversation->id,
            ],
        ]);
    }
}