<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Payment;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PremiumController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function plans()
    {
        return response()->json([
            'plans' => [
                [
                    'id' => 'premium_monthly',
                    'name' => 'Premium Mensuel',
                    'price' => 99,
                    'interval' => 'month',
                    'features' => [
                        '⭐ عروض بلا حدود',
                        '📊 تحليلات متقدمة',
                        '🏅 ظهور مميز في البحث',
                        '🎁 أولوية الدعم'
                    ]
                ],
                [
                    'id' => 'premium_yearly',
                    'name' => 'Premium Annuel',
                    'price' => 999,
                    'interval' => 'year',
                    'features' => [
                        '⭐ عروض بلا حدود',
                        '📊 تحليلات متقدمة',
                        '🏅 ظهور مميز في البحث',
                        '🎁 أولوية الدعم',
                        '💰 خصم 15%'
                    ]
                ]
            ]
        ]);
    }

    // ✅ نسخة تجريبية بدون Konnect
    public function createCardPayment(Request $request)
{
    try {
        $request->validate([
            'plan_id' => 'required|in:premium_monthly,premium_yearly'
        ]);

        $user = auth()->user();
        $planId = $request->plan_id;
        $duration = $planId === 'premium_yearly' ? 12 : 1;
        $amount = $planId === 'premium_yearly' ? 999 : 99;

        // ✅ تعديل: أضف قيم افتراضية للأعمدة الإجبارية
        $payment = Payment::create([
            'user_id' => $user->id,
            'type' => 'premium',
            'plan_id' => $planId,
            'amount' => $amount,
            'duration' => $duration,
            'method' => 'card',
            'status' => 'paid',
            'paid_at' => now(),
            'service_id' => 1,
            'purchase_id' => 1,
        ]);

        // تفعيل البريميوم مباشرة
        $user->update([
            'is_premium' => true,
            'premium_until' => now()->addMonths($duration),
            'premium_features' => [
                'plan' => $planId,
                'activated_at' => now(),
                'payment_id' => $payment->id
            ]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم تفعيل البريميوم بنجاح!',
            'is_premium' => true
        ]);

    } catch (\Exception $e) {
        Log::error('Premium payment error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'حدث خطأ: ' . $e->getMessage()
        ], 500);
    }
}

    // ✅ نسخة تجريبية للتحويل البنكي
    public function requestManualPayment(Request $request)
{
    try {
        $request->validate([
            'plan_id' => 'required|in:premium_monthly,premium_yearly'
        ]);

        $user = auth()->user();
        $planId = $request->plan_id;
        $duration = $planId === 'premium_yearly' ? 12 : 1;
        $amount = $planId === 'premium_yearly' ? 999 : 99;

        // ✅ تعديل: أضف قيم افتراضية للأعمدة الإجبارية
        $payment = Payment::create([
            'user_id' => $user->id,
            'type' => 'premium',
            'plan_id' => $planId,
            'amount' => $amount,
            'duration' => $duration,
            'method' => 'manual',
            'status' => 'pending',
            // ✅ هاد الأعمدة مطلوبين ولكن ماشي مهمين لـ Premium
            'service_id' => 1,  // قيمة مؤقتة
            'purchase_id' => 1, // قيمة مؤقتة
        ]);

        $bankInfo = [
            'bank_name' => 'CIH Bank',
            'account_name' => 'Forsa Oumal',
            'account_number' => '123 456 789 001',
            'rib' => '123456789012345678901234',
            'swift' => 'CIHMMAMC',
            'amount' => $amount,
            'reference' => 'PREMIUM_REF_' . $payment->id,
            'phone' => '+212 6 12 34 56 78'
        ];

        return response()->json([
            'success' => true,
            'payment_id' => $payment->id,
            'bank_info' => $bankInfo
        ]);

    } catch (\Exception $e) {
        Log::error('Premium manual request error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'حدث خطأ: ' . $e->getMessage()
        ], 500);
    }
}

    public function uploadReceipt(Request $request)
    {
        try {
            $request->validate([
                'payment_id' => 'required|exists:payments,id',
                'receipt' => 'required|image|mimes:jpg,jpeg,png,pdf|max:2048'
            ]);

            $payment = Payment::findOrFail($request->payment_id);

            if ($payment->user_id !== auth()->id()) {
                return response()->json(['message' => 'غير مصرح'], 403);
            }

            $path = $request->file('receipt')->store('premium_receipts', 'public');

            $payment->update([
                'receipt_path' => $path,
                'status' => 'pending'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم رفع الإثبات، في انتظار المراجعة'
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'حدث خطأ: ' . $e->getMessage()], 500);
        }
    }

    public function checkStatus(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->is_premium && $user->premium_until && now()->gt($user->premium_until)) {
                $user->update(['is_premium' => false]);
            }
            
            return response()->json([
                'is_premium' => $user->is_premium,
                'premium_until' => $user->premium_until,
                'days_left' => $user->premium_until ? ceil(now()->diffInDays($user->premium_until)) : 0,
                'plan' => $user->premium_features['plan'] ?? null
            ]);
        } catch (\Exception $e) {
            return response()->json(['is_premium' => false, 'days_left' => 0], 200);
        }
    }
}