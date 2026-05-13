<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    // Get payments for authenticated user
    public function index()
    {
        $user = Auth::user();
        
        $payments = Payment::where('client_id', $user->id)
            ->orWhere('worker_id', $user->id)
            ->with('order')
            ->latest()
            ->paginate(20);

        return response()->json($payments);
    }

    // Get payment by order
    public function getByOrder(Order $order)
    {
        if (!in_array(Auth::id(), [$order->client_id, $order->worker_id]) && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $payment = Payment::where('order_id', $order->id)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        return response()->json($payment);
    }

    // Create payment intent (for Stripe)
    public function createPaymentIntent(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0',
            'provider' => 'required|in:stripe,paypal,cash',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        if ($order->client_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Order already paid'], 422);
        }

        // Here you would integrate with Stripe/PayPal
        // For now, return a mock client secret
        return response()->json([
            'client_secret' => 'mock_client_secret_' . uniqid(),
            'amount' => $validated['amount'],
            'currency' => 'MAD',
            'order_id' => $order->id
        ]);
    }

    // Confirm payment after successful charge
    public function confirmPayment(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'transaction_id' => 'required|string',
            'provider' => 'required|in:stripe,paypal,cash',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        if ($order->client_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Order already paid'], 422);
        }

        // Check if payment already exists
        $existingPayment = Payment::where('order_id', $order->id)->first();

        if ($existingPayment) {
            return response()->json(['message' => 'Payment already exists'], 422);
        }

        $payment = Payment::create([
            'order_id' => $order->id,
            'client_id' => $order->client_id,
            'worker_id' => $order->worker_id,
            'amount' => $order->agreed_price,
            'status' => 'paid',
            'provider' => $validated['provider'],
            'transaction_id' => $validated['transaction_id'],
            'paid_at' => now(),
        ]);

        $order->update(['payment_status' => 'paid']);

        return response()->json($payment, 201);
    }

    // Get payment status
    public function status(Order $order)
    {
        if (!in_array(Auth::id(), [$order->client_id, $order->worker_id]) && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'order_id' => $order->id,
            'payment_status' => $order->payment_status,
            'amount' => $order->agreed_price,
        ]);
    }
}