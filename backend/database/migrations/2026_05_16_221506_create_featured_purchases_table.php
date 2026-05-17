<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeaturedPurchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'user_id',
        'days',
        'amount',
        'payment_method',
        'transaction_id',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}