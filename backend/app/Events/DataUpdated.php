<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DataUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $type;
    public $message;
    public $data;

    public function __construct($userId, $type, $message, $data = null)
    {
        $this->userId = $userId;
        $this->type = $type;
        $this->message = $message;
        $this->data = $data;
    }

    public function broadcastOn()
    {
        return new PrivateChannel("user.{$this->userId}.notifications");
    }

    public function broadcastAs()
    {
        return 'data.updated';
    }
}