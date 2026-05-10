<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'worker_id',
        'title',
        'description',
        'category',
        'price',
        'city',
        'images',
        'status'
    ];

    protected $casts = [
        'images' => 'array',
        'price' => 'decimal:2',
    ];

    // Relationship with User (worker)
    public function worker()
    {
        return $this->belongsTo(User::class, 'worker_id');
    }

    // Relationship with Request
    public function requests()
    {
        return $this->hasMany(Request::class);
    }

    // Scope for active services
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Accessor for full title with category
    public function getFullTitleAttribute()
    {
        return $this->title . ' (' . $this->category . ')';
    }
}