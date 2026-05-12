<?php

namespace App\Http\Controllers;

use App\Models\ServiceRequest;
use Illuminate\Http\Request;

class ServiceRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = ServiceRequest::with('client','category');

        if (auth()->user()->role === 'client') {
            $query->where('client_id', auth()->id());
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return $query->latest()->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => ['required'],
            'title' => ['required'],
            'description' => ['required'],
            'budget' => ['required'],
            'city' => ['required'],
            'visibility' => ['in:public,workers_only']
        ]);

        $requestModel = ServiceRequest::create([
            ...$data,
            'client_id' => auth()->id(),
            'status' => 'pending'
        ]);

        return $requestModel;
    }

    public function show(ServiceRequest $serviceRequest)
    {
        return $serviceRequest->load('client','category','interests');
    }

    public function update(Request $request, ServiceRequest $serviceRequest)
    {
        if ($serviceRequest->client_id !== auth()->id()) {
            return response()->json(['error' => 'unauthorized'], 403);
        }

        if (!in_array($serviceRequest->status, ['pending','in_discussion'])) {
            return response()->json(['error' => 'locked'], 400);
        }

        $serviceRequest->update($request->only([
            'title','description','budget','city','visibility'
        ]));

        return $serviceRequest;
    }

    public function cancel(ServiceRequest $serviceRequest)
    {
        if ($serviceRequest->client_id !== auth()->id()) {
            return response()->json(['error' => 'unauthorized'], 403);
        }

        $serviceRequest->update(['status' => 'cancelled']);

        return response()->json(['message' => 'cancelled']);
    }
}