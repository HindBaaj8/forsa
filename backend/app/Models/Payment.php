<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'client_id',
        'worker_id',
        'amount',
        'status',
        'provider',
        'transaction_id',
        'paid_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function worker()
    {
        return $this->belongsTo(User::class, 'worker_id');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function markAsPaid($transactionId = null)
    {
        $this->update([
            'status' => 'paid',
            'transaction_id' => $transactionId,
            'paid_at' => now(),
        ]);
    }
}