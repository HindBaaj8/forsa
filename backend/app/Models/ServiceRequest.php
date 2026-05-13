<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServiceRequest extends Model
{
    use HasFactory;

    protected $table = 'requests';

    protected $fillable = [
        'client_id',
        'category_id',
        'title',
        'description',
        'budget',
        'city',
        'visibility',
        'status',
    ];

    protected $casts = [
        'budget' => 'decimal:2',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function media()
    {
        return $this->hasMany(RequestMedia::class);
    }

    public function interests()
    {
        return $this->hasMany(Interest::class);
    }

    public function order()
    {
        return $this->hasOne(Order::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}