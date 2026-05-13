<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dispute extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'raised_by',
        'reason',
        'description',
        'status',
        'resolution_amount',
        'admin_notes',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'resolution_amount' => 'decimal:2',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_UNDER_REVIEW = 'under_review';
    const STATUS_RESOLVED = 'resolved';
    const STATUS_CLOSED = 'closed';

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function raisedBy()
    {
        return $this->belongsTo(User::class, 'raised_by');
    }

    public function evidence()
    {
        return $this->hasMany(DisputeEvidence::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function resolve($decision, $amount = null, $notes = null)
    {
        $this->update([
            'status' => self::STATUS_RESOLVED,
            'resolution_amount' => $amount,
            'admin_notes' => $notes,
            'resolved_at' => now(),
        ]);

        if ($decision === 'for_client') {
            $this->order->update(['status' => 'cancelled']);
        } elseif ($decision === 'for_worker') {
            $this->order->update(['status' => 'completed']);
        } else {
            $this->order->update(['status' => 'completed']);
        }
    }
}