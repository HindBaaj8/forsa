<?php

namespace App\Services;

use App\Models\Notification;

class NotificationService
{
    /**
     * إرسال إشعار لمستخدم
     */
    public static function send($userId, $type, $title, $message, $link = null)
    {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'link' => $link,
            'is_read' => false,
        ]);
    }
    
    /**
     * إشعار طلب جديد للعامل
     */
    public static function newRequestToWorker($workerId, $requestId, $requestTitle)
    {
        return self::send(
            $workerId,
            'new_request',
            'طلب جديد',
            "📋 طلب جديد: {$requestTitle}",
            "/worker/orders/{$requestId}"
        );
    }
    
    /**
     * إشعار طلب جديد للعميل (تم قبول الطلب)
     */
    public static function requestAccepted($clientId, $requestId, $workerName)
    {
        return self::send(
            $clientId,
            'request_accepted',
            'تم قبول طلبك',
            "✅ قام {$workerName} بقبول طلبك رقم #{$requestId}",
            "/client/requests/{$requestId}"
        );
    }
    
    /**
     * إشعار رسالة جديدة
     */
    public static function newMessage($userId, $senderName, $conversationId)
    {
        return self::send(
            $userId,
            'new_message',
            'رسالة جديدة',
            "💬 رسالة جديدة من {$senderName}",
            "/messages?conv={$conversationId}"
        );
    }
    
    /**
     * إشعار دفع مستلم
     */
    public static function paymentReceived($workerId, $amount, $orderId)
    {
        return self::send(
            $workerId,
            'payment_received',
            'دفعة مستلمة',
            "💰 تم استلام {$amount} درهم",
            "/worker/earnings"
        );
    }
    
    /**
     * إشعار طلب مكتمل
     */
    public static function requestCompleted($clientId, $requestId)
    {
        return self::send(
            $clientId,
            'request_completed',
            'طلب مكتمل',
            "🎉 تم إكمال طلبك رقم #{$requestId} بنجاح",
            "/client/requests/{$requestId}"
        );
    }
    
    /**
     * إشعار تقييم جديد
     */
    public static function newReview($workerId, $clientName, $rating)
    {
        return self::send(
            $workerId,
            'review_received',
            'تقييم جديد',
            "⭐ قام {$clientName} بتقييمك {$rating} نجوم",
            "/worker/reviews"
        );
    }
    
    /**
     * إشعار عامل تقدم لطلب
     */
    public static function workerApplied($clientId, $workerName, $requestId)
    {
        return self::send(
            $clientId,
            'worker_applied',
            'عامل تقدم لطلبك',
            "🔧 تقدم العامل {$workerName} لطلبك رقم #{$requestId}",
            "/client/requests/{$requestId}"
        );
    }
    
    /**
     * إشعار تغيير حالة الطلب
     */
    public static function orderStatusChanged($userId, $orderId, $status, $statusText)
    {
        return self::send(
            $userId,
            'order_status',
            'تحديث حالة الطلب',
            "📦 تم تحديث حالة طلبك رقم #{$orderId} إلى: {$statusText}",
            "/orders/{$orderId}"
        );
    }
    
    /**
     * إشعار تأكيد الحساب
     */
    public static function profileVerified($userId)
    {
        return self::send(
            $userId,
            'profile_verified',
            'تم توثيق حسابك',
            "✓ تم توثيق حسابك بنجاح على منصة فرصة عمل",
            "/profile"
        );
    }
    
    /**
     * جلب إشعارات غير مقروءة لمستخدم
     */
    public static function getUnreadCount($userId)
    {
        return Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();
    }
    
    /**
     * جلب آخر إشعارات المستخدم
     */
    public static function getLatest($userId, $limit = 10)
    {
        return Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}