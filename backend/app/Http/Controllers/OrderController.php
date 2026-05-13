<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $query = Order::with('request', 'client', 'worker');

        if ($user->role === 'client') {
            $query->where('client_id', $user->id);
        } elseif ($user->role === 'worker') {
            $query->where('worker_id', $user->id);
        }

        $orders = $query->latest()->paginate(20);
        return response()->json($orders);
    }

    public function show(Order $order)
    {
        if (!in_array(auth()->id(), [$order->client_id, $order->worker_id]) && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($order->load('request', 'client', 'worker', 'conversation'));
    }

    public function startWork(Order $order)
    {
        if ($order->worker_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->status !== 'accepted') {
            return response()->json(['message' => 'Order cannot be started'], 400);
        }

        $order->markAsStarted();
        return response()->json(['message' => 'Work started', 'order' => $order]);
    }

    public function completeWork(Order $order)
    {
        if ($order->worker_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($order->status !== 'in_progress') {
            return response()->json(['message' => 'Order cannot be completed'], 400);
        }

        $order->markAsCompleted();
        return response()->json(['message' => 'Work completed', 'order' => $order]);
    }

    public function cancel(Request $request, Order $order)
    {
        if (!in_array(auth()->id(), [$order->client_id, $order->worker_id])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!in_array($order->status, ['accepted', 'in_progress'])) {
            return response()->json(['message' => 'Order cannot be cancelled'], 400);
        }

        $order->markAsCancelled();
        return response()->json(['message' => 'Order cancelled']);
    }
}