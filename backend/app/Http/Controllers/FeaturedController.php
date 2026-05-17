<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\FeaturedPurchase;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FeaturedController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * عرض أسعار الميزة
     */
    public function pricing()
    {
        $packages = [
            ['days' => 3, 'price' => 29, 'label' => '3 أيام - 29 درهم', 'old_price' => 50],
            ['days' => 7, 'price' => 49, 'label' => '7 أيام - 49 درهم', 'old_price' => 100],
            ['days' => 30, 'price' => 99, 'label' => '30 يوماً - 99 درهم', 'old_price' => 300],
        ];

        return response()->json(['success' => true, 'packages' => $packages]);
    }

    /**
     * إنشاء طلب شراء
     */
    public function purchase(Request $request)
{
    try {
        \Log::info('Purchase request data:', $request->all());
        
        $request->validate([
            'service_id' => 'required|exists:services,id',
            'days' => 'required|in:3,7,30',
        ]);

        $user = $request->user();
        $service = Service::findOrFail($request->service_id);

        \Log::info('Service found:', ['id' => $service->id, 'worker_id' => $service->worker_id]);
        \Log::info('Current user:', ['id' => $user->id, 'role' => $user->role]);

        if ($service->worker_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'غير مصرح لك'], 403);
        }

        $prices = [3 => 29, 7 => 49, 30 => 99];
        $amount = $prices[$request->days];

        $purchase = FeaturedPurchase::create([
            'service_id' => $service->id,
            'user_id' => $user->id,
            'days' => $request->days,
            'amount' => $amount,
            'payment_method' => null,
            'status' => 'pending',
            'transaction_id' => 'TXN_' . time() . '_' . $user->id
        ]);

        return response()->json([
            'success' => true,
            'purchase' => $purchase
        ]);

    } catch (\Exception $e) {
        \Log::error('Purchase error: ' . $e->getMessage());
        \Log::error('Stack trace: ' . $e->getTraceAsString());
        return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
    }
}   /**
     * تفعيل الميزة (دالة خاصة)
     */
    private function activateFeatured($purchase)
    {
        $purchase->update([
            'status' => 'active',
            'start_date' => now(),
            'end_date' => now()->addDays($purchase->days)
        ]);

        $purchase->service->update([
            'is_featured' => true,
            'featured_until' => now()->addDays($purchase->days)
        ]);

        Log::info('Featured activated for service: ' . $purchase->service_id);
    }

    /**
     * Webhook من Konnect
     */
    public function webhook(Request $request)
    {
        Log::info('Konnect webhook received:', $request->all());

        $transactionId = $request->input('id');
        $status = $request->input('status');

        $payment = Payment::where('transaction_id', $transactionId)->first();

        if (!$payment) {
            Log::error('Payment not found: ' . $transactionId);
            return response()->json(['error' => 'Payment not found'], 404);
        }

        if ($status === 'completed') {
            $payment->update(['status' => 'paid', 'paid_at' => now()]);
            $purchase = FeaturedPurchase::find($payment->purchase_id);
            $this->activateFeatured($purchase);
        } else {
            $payment->update(['status' => 'failed']);
        }

        return response()->json(['success' => true]);
    }

    /**
     * قبول الدفع اليدوي (لـ Admin فقط)
     */
    public function approveManualPayment($paymentId)
    {
        $payment = Payment::findOrFail($paymentId);
        
        if (!$payment->receipt_path) {
            return response()->json(['success' => false, 'message' => 'لا يوجد إثبات دفع'], 422);
        }

        if ($payment->status === 'paid') {
            return response()->json(['success' => false, 'message' => 'تم قبول الدفع مسبقاً'], 422);
        }

        $payment->update(['status' => 'paid', 'paid_at' => now()]);
        $purchase = FeaturedPurchase::find($payment->purchase_id);
        $this->activateFeatured($purchase);

        return response()->json(['success' => true, 'message' => 'تم قبول الدفع وتفعيل الميزة']);
    }

    /**
     * الحصول على خدمات مميزة
     */
    public function getFeaturedServices()
    {
        $services = Service::with(['worker', 'category'])
            ->where('is_featured', true)
            ->where('featured_until', '>', now())
            ->where('approval_status', 'approved')
            ->where('is_active', true)
            ->latest('featured_until')
            ->get();

        return response()->json(['success' => true, 'data' => $services]);
    }

    /**
     * تنظيف الخدمات المنتهية
     */
    public function checkExpired()
    {
        $expiredServices = Service::where('is_featured', true)
            ->where('featured_until', '<', now())
            ->get();

        $count = 0;
        foreach ($expiredServices as $service) {
            $service->update(['is_featured' => false, 'featured_until' => null]);
            $count++;
        }

        return response()->json(['success' => true, 'message' => "تم تحديث {$count} خدمة منتهية"]);
    }
}