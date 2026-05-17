<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',           // ✅ أضف هذا
        'service_id',        // ✅ أضف هذا
        'purchase_id',       // ✅ أضف هذا
        'amount',
        'method',            // ✅ أضف هذا
        'status',
        'transaction_id',
        'konnect_payment_url',
        'receipt_path',
        'paid_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    // العلاقات
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function purchase()
    {
        return $this->belongsTo(FeaturedPurchase::class, 'purchase_id');
    }
}