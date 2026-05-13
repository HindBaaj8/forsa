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
        'password',
        'role',
        'phone',
        'city',
        'avatar',
        'bio',
        'rating',
        'total_reviews',
        'status',
        'is_online',
        'last_seen_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'is_online' => 'boolean',
        'rating' => 'decimal:2',
    ];

    public function services()
    {
        return $this->hasMany(Service::class, 'worker_id');
    }

    public function requests()
    {
        return $this->hasMany(ServiceRequest::class, 'client_id');
    }

    public function interests()
    {
        return $this->hasMany(Interest::class, 'worker_id');
    }

    public function ordersAsClient()
    {
        return $this->hasMany(Order::class, 'client_id');
    }

    public function ordersAsWorker()
    {
        return $this->hasMany(Order::class, 'worker_id');
    }

    public function conversationsAsClient()
    {
        return $this->hasMany(Conversation::class, 'client_id');
    }

    public function conversationsAsWorker()
    {
        return $this->hasMany(Conversation::class, 'worker_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'client_id');
    }

    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'client_id');
    }

    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'worker_id');
    }

    public function paymentsAsClient()
    {
        return $this->hasMany(Payment::class, 'client_id');
    }

    public function paymentsAsWorker()
    {
        return $this->hasMany(Payment::class, 'worker_id');
    }

    public function reports()
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    public function disputesRaised()
    {
        return $this->hasMany(Dispute::class, 'raised_by');
    }

    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeWorkers($query)
    {
        return $query->where('role', 'worker');
    }

    public function scopeClients($query)
    {
        return $query->where('role', 'client');
    }
}