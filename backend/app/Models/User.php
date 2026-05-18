<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'role',
        'phone',
        'city',
        'avatar',
        'bio',
        'rating',
        'total_reviews',
        'status',
        'is_online',
        'last_seen_at',
        'is_premium',        // ✅ أضف هاد
        'premium_until',     // ✅ أضف هاد
        'premium_features'   // ✅ أضف هاد
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'is_online' => 'boolean',
        'rating' => 'decimal:2',
        'premium_until' => 'datetime',
        'premium_features' => 'array',
        'is_premium' => 'boolean',
    ];

    // ========== العلاقات ==========
    public function services()
    {
        return $this->hasMany(Service::class, 'worker_id');
    }

    public function requests()
    {
        return $this->hasMany(ServiceRequest::class, 'client_id');
    }

    public function interests()
    {
        return $this->hasMany(Interest::class, 'worker_id');
    }

    public function ordersAsClient()
    {
        return $this->hasMany(Order::class, 'client_id');
    }

    public function ordersAsWorker()
    {
        return $this->hasMany(Order::class, 'worker_id');
    }

    public function conversationsAsClient()
    {
        return $this->hasMany(Conversation::class, 'client_id');
    }

    public function conversationsAsWorker()
    {
        return $this->hasMany(Conversation::class, 'worker_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'client_id');
    }

    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'client_id');
    }

    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'worker_id');
    }

    public function paymentsAsClient()
    {
        return $this->hasMany(Payment::class, 'client_id');
    }

    public function paymentsAsWorker()
    {
        return $this->hasMany(Payment::class, 'worker_id');
    }

    public function reports()
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    public function disputesRaised()
    {
        return $this->hasMany(Dispute::class, 'raised_by');
    }

    // ========== مدفوعات البريميوم ==========
    public function premiumPayments()
    {
        return $this->hasMany(Payment::class, 'user_id')->where('type', 'premium');
    }

    // ========== خصائص محسوبة ==========
    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    // ========== ميثودات البريميوم ==========
    
    /**
     * التحقق من أن المستخدم بريميوم نشط
     */
    public function isPremium()
    {
        return $this->is_premium && ($this->premium_until ? now()->lt($this->premium_until) : true);
    }
    
    /**
     * الحد الأقصى للعروض في الشهر
     */
    public function getMaxOffersPerMonthAttribute()
    {
        return $this->isPremium() ? 999 : 5;
    }
    
    /**
     * الحد الأقصى للطلبات في اليوم
     */
    public function getMaxRequestsPerDayAttribute()
    {
        return $this->isPremium() ? 100 : 10;
    }
    
    /**
     * تفعيل البريميوم للمستخدم
     */
    public function activatePremium($durationInMonths = 1, $planId = 'premium_monthly')
    {
        $this->update([
            'is_premium' => true,
            'premium_until' => now()->addMonths($durationInMonths),
            'premium_features' => [
                'plan' => $planId,
                'activated_at' => now(),
                'expires_at' => now()->addMonths($durationInMonths)
            ]
        ]);
    }
    
    /**
     * إلغاء البريميوم
     */
    public function deactivatePremium()
    {
        $this->update([
            'is_premium' => false,
            'premium_until' => null
        ]);
    }
    
    /**
     * التحقق من أن البريميوم لم ينتهِ
     */
    public function hasValidPremium()
    {
        if (!$this->is_premium) {
            return false;
        }
        
        if ($this->premium_until && now()->gt($this->premium_until)) {
            $this->deactivatePremium();
            return false;
        }
        
        return true;
    }

    // ========== النطاقات (Scopes) ==========
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeWorkers($query)
    {
        return $query->where('role', 'worker');
    }

    public function scopeClients($query)
    {
        return $query->where('role', 'client');
    }
    
    public function scopePremium($query)
    {
        return $query->where('is_premium', true)
            ->where(function($q) {
                $q->whereNull('premium_until')
                  ->orWhere('premium_until', '>', now());
            });
    }
}