<?php

namespace App\Http\Controllers;

use App\Models\Interest;
use App\Models\ServiceRequest;
use App\Services\OrderService;
use Illuminate\Http\Request;

class InterestController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function store(Request $request, $requestId)
    {
        if (auth()->user()->role !== 'worker') {
            return response()->json(['message' => 'Only workers can send interests'], 403);
        }

        $serviceRequest = ServiceRequest::findOrFail($requestId);

        if ($serviceRequest->status !== 'pending') {
            return response()->json(['message' => 'Request is no longer accepting interests'], 400);
        }

        $existing = Interest::where('worker_id', auth()->id())
            ->where('request_id', $requestId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You already expressed interest'], 400);
        }

        $validated = $request->validate([
            'message' => 'nullable|string|max:500',
        ]);

        $interest = Interest::create([
            'worker_id' => auth()->id(),
            'request_id' => $requestId,
            'message' => $validated['message'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json($interest, 201);
    }

    public function index($requestId)
    {
        $serviceRequest = ServiceRequest::findOrFail($requestId);

        if ($serviceRequest->client_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $interests = Interest::where('request_id', $requestId)
            ->with('worker')
            ->latest()
            ->get();

        return response()->json($interests);
    }

    public function accept($interestId)
    {
        $interest = Interest::findOrFail($interestId);
        $serviceRequest = $interest->request;

        if ($serviceRequest->client_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($serviceRequest->status !== 'pending') {
            return response()->json(['message' => 'Request is no longer available'], 400);
        }

        if ($interest->status !== 'pending') {
            return response()->json(['message' => 'This interest cannot be accepted'], 400);
        }

        $order = $this->orderService->createOrderFromInterest($interest);

        return response()->json([
            'message' => 'Interest accepted successfully',
            'order' => $order
        ]);
    }

    public function reject($interestId)
    {
        $interest = Interest::findOrFail($interestId);
        $serviceRequest = $interest->request;

        if ($serviceRequest->client_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($interest->status !== 'pending') {
            return response()->json(['message' => 'This interest cannot be rejected'], 400);
        }

        $interest->update(['status' => 'rejected']);
        return response()->json(['message' => 'Interest rejected']);
    }
}