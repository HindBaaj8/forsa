<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'request_id', 'client_id', 'worker_id', 'service_id',
        'price', 'status', 'scheduled_date', 'scheduled_time', 'address'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'scheduled_date' => 'date',
        'scheduled_time' => 'datetime',
    ];

    public function request()
    {
        return $this->belongsTo(Request::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function worker()
    {
        return $this->belongsTo(User::class, 'worker_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}