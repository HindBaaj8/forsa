<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'path',
        'type',
        'mime_type',
        'size',
    ];

    public function request()
    {
        return $this->belongsTo(ServiceRequest::class);
    }
}