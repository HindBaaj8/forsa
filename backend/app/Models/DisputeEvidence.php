<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DisputeEvidence extends Model
{
    use HasFactory;

    protected $fillable = [
        'dispute_id',
        'submitted_by',
        'type',
        'path',
        'description',
        'visibility',
    ];

    const VISIBILITY_ADMIN_ONLY = 'admin_only';
    const VISIBILITY_BOTH_PARTIES = 'both_parties';

    public function dispute()
    {
        return $this->belongsTo(Dispute::class);
    }

    public function submittedBy()
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}