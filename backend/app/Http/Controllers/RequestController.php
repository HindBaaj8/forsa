<?php

namespace App\Http\Controllers;

use App\Models\ServiceRequest;
use Illuminate\Http\Request;

class ServiceRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = ServiceRequest::with('client', 'category');

        if (auth()->user()->role === 'client') {
            $query->where('client_id', auth()->id());
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $requests = $query->latest()->paginate(20);
        return response()->json($requests);
    }

    public function show(ServiceRequest $serviceRequest)
    {
        // Check if user is authorized to view this request
        if (auth()->user()->role !== 'admin' && 
            auth()->id() !== $serviceRequest->client_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($serviceRequest->load('client', 'category', 'interests.worker'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'budget' => 'required|numeric|min:0',
            'city' => 'required|string',
            'visibility' => 'sometimes|in:public,workers_only',
        ]);

        $serviceRequest = ServiceRequest::create([
            'client_id' => auth()->id(),
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'budget' => $validated['budget'],
            'city' => $validated['city'],
            'visibility' => $validated['visibility'] ?? 'public',
            'status' => 'pending',
        ]);

        return response()->json($serviceRequest, 201);
    }

    public function update(Request $request, ServiceRequest $serviceRequest)
    {
        if ($serviceRequest->client_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!in_array($serviceRequest->status, ['pending', 'in_discussion'])) {
            return response()->json(['message' => 'Cannot update completed or cancelled request'], 400);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'budget' => 'sometimes|numeric|min:0',
            'city' => 'sometimes|string',
            'visibility' => 'sometimes|in:public,workers_only',
        ]);

        $serviceRequest->update($validated);
        return response()->json($serviceRequest);
    }

    public function destroy(ServiceRequest $serviceRequest)
    {
        if ($serviceRequest->client_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($serviceRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending requests can be deleted'], 400);
        }

        $serviceRequest->delete();
        return response()->json(['message' => 'Request deleted']);
    }

    public function cancel(ServiceRequest $serviceRequest)
    {
        if ($serviceRequest->client_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!in_array($serviceRequest->status, ['pending', 'in_discussion'])) {
            return response()->json(['message' => 'Cannot cancel completed request'], 400);
        }

        $serviceRequest->update(['status' => 'cancelled']);
        
        // Also cancel all pending interests
        $serviceRequest->interests()->where('status', 'pending')->update(['status' => 'rejected']);
        
        return response()->json(['message' => 'Request cancelled']);
    }
}