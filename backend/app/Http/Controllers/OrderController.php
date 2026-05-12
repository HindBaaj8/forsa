<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\OrderService;

class OrderController extends Controller
{
    public function __construct(private OrderService $orderService)
    {
        $this->middleware('auth:sanctum');
    }

    public function index()
    {
        $user = auth()->user();

        return Order::with('request','client','worker')
            ->when($user->role === 'client', fn($q) => $q->where('client_id',$user->id))
            ->when($user->role === 'worker', fn($q) => $q->where('worker_id',$user->id))
            ->latest()
            ->paginate(20);
    }

    public function show(Order $order)
    {
        return $order->load('request','conversation');
    }

    public function start(Order $order)
    {
        return $this->orderService->startOrder($order);
    }

    public function complete(Order $order)
    {
        return $this->orderService->completeOrder($order);
    }

    public function cancel(Order $order)
    {
        return $this->orderService->cancelOrder($order);
    }
}