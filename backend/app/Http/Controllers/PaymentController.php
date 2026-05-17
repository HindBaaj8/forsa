<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\FeaturedPurchase;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['webhook']);
    }

    /**
     * إنشاء طلب دفع عبر Konnect (بطاقة بنكية)
     */
    public function createCardPayment(Request $request)
    {
        $request->validate([
            'purchase_id' => 'required|exists:featured_purchases,id'
        ]);

        $purchase = FeaturedPurchase::findOrFail($request->purchase_id);
        $service = Service::findOrFail($purchase->service_id);

        $payment = Payment::create([
            'user_id' => auth()->id(),
            'service_id' => $service->id,
            'purchase_id' => $purchase->id,
            'amount' => $purchase->amount,
            'method' => 'card',
            'status' => 'pending'
        ]);

        $konnectResponse = Http::withHeaders([
            'X-API-Key' => env('KONNECT_API_KEY'),
            'Content-Type' => 'application/json'
        ])->post('https://api.konnect.network/v1/payments', [
            'amount' => $purchase->amount,
            'currency' => 'MAD',
            'reference' => $payment->id,
            'description' => "Featured service: {$service->title}",
            'success_url' => env('APP_URL') . '/payment/success',
            'error_url' => env('APP_URL') . '/payment/error',
            'webhook_url' => env('APP_URL') . '/api/payments/webhook'
        ]);

        if ($konnectResponse->successful()) {
            $paymentUrl = $konnectResponse->json('payment_url');
            $payment->update([
                'konnect_payment_url' => $paymentUrl,
                'transaction_id' => $konnectResponse->json('id')
            ]);

            return response()->json([
                'success' => true,
                'payment_url' => $paymentUrl,
                'payment_id' => $payment->id
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'فشل إنشاء طلب الدفع'
        ], 500);
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
        } else {
            $payment->update(['status' => 'failed']);
        }

        return response()->json(['success' => true]);
    }

    /**
     * طلب دفع يدوي (تحويل بنكي)
     */
    public function requestManualPayment(Request $request)
{
    $request->validate([
        'purchase_id' => 'required|exists:featured_purchases,id'
    ]);

    $user = auth()->user();
    $purchase = FeaturedPurchase::findOrFail($request->purchase_id);
    $service = Service::findOrFail($purchase->service_id);

    $payment = Payment::create([
        'user_id' => $user->id,
        'service_id' => $service->id,
        'purchase_id' => $purchase->id,
        'amount' => $purchase->amount,
        'method' => 'manual',
        'status' => 'pending'
    ]);

    // ✅ معلومات RIB كاملة
    $bankInfo = [
        'bank_name' => 'CIH Bank',
        'account_name' => 'Forsa Oumal',
        'account_number' => '123 456 789 001',
        'rib' => '123456789012345678901234',
        'swift' => 'CIHMMAMC',
        'amount' => $purchase->amount,
        'reference' => 'REF-' . $purchase->id,
        'phone' => '+212 6 12 34 56 78'
    ];

    return response()->json([
        'success' => true,
        'payment_id' => $payment->id,
        'bank_info' => $bankInfo
    ]);
}    
/**
 * رفع إثبات الدفع (للمدفوعات اليدوية)
 */
use App\Models\Notification;
use App\Models\User;

public function uploadReceipt(Request $request)
{
    try {
        $request->validate([
            'purchase_id' => 'required|exists:featured_purchases,id',
            'receipt' => 'required|image|mimes:jpg,jpeg,png,pdf|max:2048'
        ]);

        $purchase = FeaturedPurchase::findOrFail($request->purchase_id);
        $payment = Payment::where('purchase_id', $purchase->id)->first();

        if (!$payment) {
            return response()->json(['message' => 'طلب الدفع غير موجود'], 404);
        }

        if ($payment->user_id !== auth()->id()) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $path = $request->file('receipt')->store('payment_receipts', 'public');

        $payment->update([
            'receipt_path' => $path,
            'status' => 'pending'
        ]);

        // ✅ 🔥 إرسال إشعار للمسؤول (Admin) 🔥 ✅
        $admins = User::where('role', 'admin')->get();
        
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'manual_payment_receipt',
                'title' => '📎 إثبات دفع جديد في انتظار المراجعة',
                'message' => "المستخدم {$payment->user->first_name} {$payment->user->last_name} قام برفع إثبات دفع للميزة المميزة. المبلغ: {$payment->amount} درهم",
                'data' => json_encode([
                    'payment_id' => $payment->id,
                    'purchase_id' => $purchase->id,
                    'user_id' => $payment->user_id,
                    'amount' => $payment->amount,
                    'receipt_url' => asset('storage/' . $path)
                ]),
                'link' => '/admin/payments/manual/' . $payment->id,
                'is_read' => false
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم رفع الإثبات، في انتظار المراجعة'
        ]);

    } catch (\Exception $e) {
        \Log::error('Upload receipt error: ' . $e->getMessage());
        return response()->json(['success' => false, 'message' => 'حدث خطأ: ' . $e->getMessage()], 500);
    }
}    public function approveManualPayment($paymentId)
    {
        $payment = Payment::findOrFail($paymentId);
        
        if (!$payment->receipt_path) {
            return response()->json(['success' => false, 'message' => 'لا يوجد إثبات دفع'], 422);
        }

        if ($payment->status === 'paid') {
            return response()->json(['success' => false, 'message' => 'تم قبول الدفع مسبقاً'], 422);
        }

        $payment->update(['status' => 'paid', 'paid_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'تم قبول الدفع'
        ]);
    }
}