<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',   
        'last_name',    
        'email',
        'phone',        
        'city',         
        'avatar',
        'role',        
        'status',       
        'bio',
        'rating',
        'total_reviews',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'rating' => 'decimal:2',
    ];

    // Helper methods (ختيار)
    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isWorker()
    {
        return $this->role === 'worker';
    }

    public function isClient()
    {
        return $this->role === 'client';
    }
    // app/Models/User.php - Add these relationships

public function conversationsAsClient()
{
    return $this->hasMany(Conversation::class, 'client_id');
}

public function conversationsAsWorker()
{
    return $this->hasMany(Conversation::class, 'worker_id');
}

public function conversationsAsAdmin()
{
    return $this->hasMany(Conversation::class, 'admin_id');
}

public function sentMessages()
{
    return $this->hasMany(Message::class, 'sender_id');
}

public function unreadMessagesCount()
{
    return $this->sentMessages()
        ->where('is_read', false)
        ->where('receiver_id', $this->id)
        ->count();
}
}