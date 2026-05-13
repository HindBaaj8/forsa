<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'worker_id',
        'order_id',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function worker()
    {
        return $this->belongsTo(User::class, 'worker_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    public function getOtherParticipant($userId)
    {
        if ($this->client_id === $userId) {
            return $this->worker;
        }
        if ($this->worker_id === $userId) {
            return $this->client;
        }
        return null;
    }

    public function updateLastMessage()
    {
        $lastMessage = $this->messages()->latest()->first();
        if ($lastMessage) {
            $this->update(['last_message_at' => $lastMessage->created_at]);
        }
    }
}