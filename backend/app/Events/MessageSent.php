<?php

namespace App\Events;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $conversationId;
    public $senderId;
    public $senderName;
    public $createdAt;

    /**
     * Create a new event instance.
     */
    public function __construct($message, $conversationId, $senderId, $senderName)
    {
        $this->message = $message;
        $this->conversationId = $conversationId;
        $this->senderId = $senderId;
        $this->senderName = $senderName;
        $this->createdAt = now();
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn()
    {
        return new PrivateChannel('conversation.' . $this->conversationId);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs()
    {
        return 'message.sent';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith()
    {
        return [
            'id' => $this->message->id ?? rand(1000, 9999),
            'message' => $this->message->message ?? $this->message,
            'sender_id' => $this->senderId,
            'sender_name' => $this->senderName,
            'conversation_id' => $this->conversationId,
            'created_at' => $this->createdAt->toISOString(),
        ];
    }
}