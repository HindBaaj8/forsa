<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Display a listing of approved services (public)
     */
    public function index(Request $request)
{
    try {
        $query = Service::with(['worker', 'category'])
            ->where('approval_status', 'approved')
            ->where('is_active', true);

        // Filters
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->has('city')) {
            $query->where('location', 'like', '%' . $request->city . '%');
        }
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // ✅ Featured first
        $query->orderByRaw('CASE WHEN is_featured = 1 AND featured_until > NOW() THEN 0 ELSE 1 END');
        
        // Sorting
        $sortBy = $request->get('sort_by', 'latest');
        switch ($sortBy) {
            case 'price_low': $query->orderBy('price', 'asc'); break;
            case 'price_high': $query->orderBy('price', 'desc'); break;
            case 'oldest': $query->oldest(); break;
            default: $query->latest(); break;
        }

        $services = $query->paginate($request->get('per_page', 20));

        return response()->json(['success' => true, 'data' => $services]);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Server error'], 500);
    }
}
    /**
     * Store a newly created service
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'category_id' => 'required|exists:categories,id',
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'location' => 'required|string',
            ]);

            $service = Service::create([
                'worker_id' => auth()->id(),
                'category_id' => $validated['category_id'],
                'title' => $validated['title'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'location' => $validated['location'],
                'approval_status' => 'pending',
                'is_active' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Service created successfully',
                'data' => $service
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Update the specified service
     */
    public function update(Request $request, Service $service)
    {
        if ($service->worker_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $validated = $request->validate([
                'category_id' => 'sometimes|exists:categories,id',
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'price' => 'sometimes|numeric|min:0',
                'location' => 'sometimes|string',
                'is_active' => 'sometimes|boolean',
            ]);

            $service->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Service updated successfully',
                'data' => $service
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Remove the specified service
     */
    public function destroy(Service $service)
    {
        if ($service->worker_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $service->delete();
            return response()->json([
                'success' => true,
                'message' => 'Service deleted'
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Toggle service active status
     */
    public function toggle(Service $service)
    {
        if ($service->worker_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $service->update(['is_active' => !$service->is_active]);
            return response()->json([
                'success' => true,
                'message' => 'Service toggled',
                'data' => $service
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Approve service (admin only)
     */
    public function approve(Service $service)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $service->update([
                'approval_status' => 'approved',
                'approved_at' => now(),
            ]);
            return response()->json([
                'success' => true,
                'message' => 'Service approved'
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }

    /**
     * Reject service (admin only)
     */
    public function reject(Request $request, Service $service)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $validated = $request->validate([
                'reason' => 'required|string'
            ]);

            $service->update([
                'approval_status' => 'rejected',
                'rejection_reason' => $validated['reason'],
            ]);
            return response()->json([
                'success' => true,
                'message' => 'Service rejected'
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error'], 500);
        }
    }
}