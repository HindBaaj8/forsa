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

        $requests = $query->latest()->paginate(20);
        return response()->json($requests);
    }

    public function show(ServiceRequest $serviceRequest)
    {
        return response()->json($serviceRequest->load('client', 'category', 'interests'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'budget' => 'required|numeric|min:1|max:99999999',
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
    // أضف هاد الدالة فـ ServiceRequestController.php

public function accept($id)
{
    try {
        $user = auth()->user();
        $request = ServiceRequest::findOrFail($id);
        
        if ($user->role !== 'worker') {
            return response()->json(['message' => 'Only workers can accept requests'], 403);
        }
        
        if ($request->status !== 'pending') {
            return response()->json(['message' => 'Request is no longer pending'], 400);
        }
        
        // ✅ تغيير الحالة إلى accepted (قيد التنفيذ)
        $request->update([
            'status' => 'accepted',
            'accepted_by' => $user->id,
            'accepted_at' => now()
        ]);
        
        // ✅ إنشاء إشعار للعميل
        Notification::create([
            'user_id' => $request->client_id,
            'type' => 'request_accepted',
            'title' => '✅ تم قبول طلبك',
            'message' => "المهني {$user->first_name} {$user->last_name} قبل طلبك: {$request->title}",
            'link' => '/client/requests'
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Request accepted successfully',
            'data' => $request
        ]);
        
    } catch (\Exception $e) {
        return response()->json(['message' => $e->getMessage()], 500);
    }
}
    public function update(Request $request, ServiceRequest $serviceRequest)
    {
        if ($serviceRequest->client_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'budget' => 'sometimes|numeric|min:0',
            'city' => 'sometimes|string',
        ]);

        $serviceRequest->update($validated);
        return response()->json($serviceRequest);
    }

    public function destroy(ServiceRequest $serviceRequest)
    {
        if ($serviceRequest->client_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $serviceRequest->delete();
        return response()->json(['message' => 'Request deleted']);
    }

    public function cancel(ServiceRequest $serviceRequest)
    {
        if ($serviceRequest->client_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $serviceRequest->update(['status' => 'cancelled']);
        return response()->json(['message' => 'Request cancelled']);
    }
}