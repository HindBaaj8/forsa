<?php

namespace App\Http\Controllers;

use App\Models\Interest;
use App\Models\ServiceRequest;
use App\Services\OrderService;
use Illuminate\Http\Request;

class InterestController extends Controller
{
    public function __construct(private OrderService $orderService)
    {
        $this->middleware('auth:sanctum');
    }

    public function store(Request $request, $requestId)
    {
        if (auth()->user()->role !== 'worker') {
            return response()->json(['error' => 'for workers only'], 403);
        }

        $serviceRequest = ServiceRequest::findOrFail($requestId);

        if ($serviceRequest->status !== 'pending') {
            return response()->json(['error' => 'closed request'], 400);
        }

        $exists = Interest::where([
            'worker_id' => auth()->id(),
            'request_id' => $requestId
        ])->exists();

        if ($exists) {
            return response()->json(['error' => 'already sent'], 400);
        }

        $interest = Interest::create([
            'worker_id' => auth()->id(),
            'request_id' => $requestId,
            'message' => $request->message,
            'status' => 'pending'
        ]);

        return $interest;
    }

    public function accept($interestId)
    {
        $interest = Interest::findOrFail($interestId);

        if ($interest->request->client_id !== auth()->id()) {
            return response()->json(['error' => 'unauthorized'], 403);
        }

        $order = $this->orderService->createOrderFromInterest($interest);

        return response()->json($order);
    }

    public function reject($interestId)
    {
        $interest = Interest::findOrFail($interestId);

        $interest->update(['status' => 'rejected']);

        return response()->json(['message' => 'rejected']);
    }
}