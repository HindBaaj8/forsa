<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',          // استخدم body بدل message
        'data',
        'action_url',    // استخدم action_url بدل link
        'read_at',       // استخدم read_at بدل is_read
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    // Helper method للتحقق إذا كانت مقروءة
    public function isRead()
    {
        return !is_null($this->read_at);
    }
    
    // Helper method لتعليمها كمقروءة
    public function markAsRead()
    {
        $this->update(['read_at' => now()]);
    }
}