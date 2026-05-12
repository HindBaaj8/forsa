<?php

namespace App\Events;

use App\Models\Interest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InterestAccepted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $interest;

    public function __construct(Interest $interest)
    {
        $this->interest = $interest->load('request', 'worker');
    }

    // 📡 broadcast channel
    public function broadcastOn(): array
    {
        // خاص كل client يشوف غير notifications ديالو
        return [
            new PrivateChannel('user.' . $this->interest->request->client_id),
            new PrivateChannel('user.' . $this->interest->worker_id),
        ];
    }

    // 📦 data اللي غادي تمشي للfrontend
    public function broadcastWith(): array
    {
        return [
            'interest_id' => $this->interest->id,
            'request_id' => $this->interest->request_id,
            'worker_id' => $this->interest->worker_id,
            'status' => 'accepted',
            'message' => 'Your interest was accepted',
        ];
    }

    public function broadcastAs(): string
    {
        return 'interest.accepted';
    }
}