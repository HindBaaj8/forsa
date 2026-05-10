<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = [
        'client_id', 'worker_id', 'admin_id', 'request_id',
        'last_message', 'last_message_at', 'type'
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    // Relationships
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function worker()
    {
        return $this->belongsTo(User::class, 'worker_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function request()
    {
        return $this->belongsTo(Request::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    // Scopes
    public function scopeForUser($query, $userId, $role)
    {
        if ($role === 'client') {
            return $query->where('client_id', $userId);
        } elseif ($role === 'worker') {
            return $query->where('worker_id', $userId);
        } else {
            return $query->where('admin_id', $userId);
        }
    }

    // Accessors
    public function getOtherParticipantAttribute($userId)
    {
        if ($this->client_id == $userId) {
            return $this->worker;
        }
        if ($this->worker_id == $userId) {
            return $this->client;
        }
        return $this->admin;
    }
}