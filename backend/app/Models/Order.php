<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'client_id',
        'worker_id',
        'conversation_id',
        'agreed_price',
        'status',
        'payment_status',
        'accepted_at',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'agreed_price' => 'decimal:2',
    ];

    const STATUS_ACCEPTED = 'accepted';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_DISPUTED = 'disputed';

    const PAYMENT_UNPAID = 'unpaid';
    const PAYMENT_PENDING = 'pending';
    const PAYMENT_PAID = 'paid';
    const PAYMENT_REFUNDED = 'refunded';

    public function request()
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function worker()
    {
        return $this->belongsTo(User::class, 'worker_id');
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }

    public function dispute()
    {
        return $this->hasOne(Dispute::class);
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', self::STATUS_IN_PROGRESS);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [self::STATUS_ACCEPTED, self::STATUS_IN_PROGRESS]);
    }

    public function markAsStarted()
    {
        $this->update([
            'status' => self::STATUS_IN_PROGRESS,
            'started_at' => now(),
        ]);
    }

    public function markAsCompleted()
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
        $this->request->update(['status' => 'completed']);
    }

    public function markAsCancelled()
    {
        $this->update(['status' => self::STATUS_CANCELLED]);
        $this->request->update(['status' => 'pending']);
    }
}