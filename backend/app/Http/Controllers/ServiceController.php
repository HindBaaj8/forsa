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
    $query = Service::with(['worker' => function($q) {
            $q->select('id', 'first_name', 'last_name', 'rating', 'is_premium', 'premium_until');
        }, 'category'])
        ->where('approval_status', 'approved')
        ->where('is_active', true);

    // ✅ الفلاتر الأساسية
    if ($request->has('category_id')) {
        $query->where('category_id', $request->category_id);
    }
    if ($request->has('city')) {
        $query->where('location', 'like', '%' . $request->city . '%');
    }
    if ($request->has('search')) {
        $query->where('title', 'like', '%' . $request->search . '%');
    }
    
    // ✅ ترتيب عادل (is_featured فقط، ماشي is_premium)
    $query->orderByRaw('CASE WHEN is_featured = 1 AND featured_until > NOW() THEN 0 ELSE 1 END');
    $query->latest();

    $services = $query->paginate(20);
    
    // ✅ أضف معلومات الـ premium للـ response
    $services->getCollection()->transform(function($service) {
        $service->is_premium_service = false;
        $service->premium_badge = null;
        
        if ($service->worker && $service->worker->is_premium) {
            $service->is_premium_service = true;
            $service->premium_badge = [
                'text' => '⭐ عضوية مميزة',
                'color' => 'gold',
                'expires_at' => $service->worker->premium_until
            ];
        }
        
        return $service;
    });

    return response()->json([
        'success' => true, 
        'data' => $services,
        'meta' => [
            'current_page' => $services->currentPage(),
            'total' => $services->total(),
            'per_page' => $services->perPage(),
        ]
    ]);
}
    /**
     * Display the specified service
     */
    public function show($id)
    {
        try {
            $service = Service::with(['worker', 'category'])
                ->where('approval_status', 'approved')
                ->where('is_active', true)
                ->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $service
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Service not found'
            ], 404);
        }
    }

    /**
     * Get services for map (with coordinates)
     */
    public function getMapServices(Request $request)
    {
        try {
            $query = Service::with(['worker', 'category'])
                ->where('approval_status', 'approved')
                ->where('is_active', true)
                ->whereNotNull('latitude')
                ->whereNotNull('longitude');

            // ✅ تطبيق الفلاتر
            if ($request->has('category_id') && $request->category_id) {
                $query->where('category_id', $request->category_id);
            }
            
            if ($request->has('city') && $request->city) {
                $query->where('location', 'like', '%' . $request->city . '%');
            }
            
            if ($request->has('search') && $request->search) {
                $query->where('title', 'like', '%' . $request->search . '%');
            }

            $services = $query->get(['id', 'title', 'latitude', 'longitude', 'price', 'worker_id', 'category_id', 'location'])
                ->map(function($service) {
                    return [
                        'id' => $service->id,
                        'title' => $service->title,
                        'latitude' => (float) $service->latitude,
                        'longitude' => (float) $service->longitude,
                        'price' => (float) $service->price,
                        'location' => $service->location,
                        'worker_name' => $service->worker ? ($service->worker->first_name . ' ' . $service->worker->last_name) : 'مقدم خدمة',
                        'worker_rating' => $service->worker ? (float) ($service->worker->rating ?? 0) : 0,
                        'category_icon' => $service->category ? ($service->category->icon ?? '📍') : '📍',
                        'category_name' => $service->category ? $service->category->name : 'خدمة'
                    ];
                });

            return response()->json([
                'success' => true, 
                'data' => $services,
                'count' => $services->count()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching map services: ' . $e->getMessage()
            ], 500);
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
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180'
            ]);

            // ✅ تخزين الموقع إذا وجد
            $service = Service::create([
                'worker_id' => auth()->id(),
                'category_id' => $validated['category_id'],
                'title' => $validated['title'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'location' => $validated['location'],
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'approval_status' => 'pending',
                'is_active' => true,
            ]);

            return response()->json([
                'success' => true, 
                'data' => $service,
                'message' => 'Service created successfully'
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified service
     */
    public function update(Request $request, Service $service)
    {
        if ($service->worker_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $validated = $request->validate([
                'category_id' => 'sometimes|exists:categories,id',
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'price' => 'sometimes|numeric|min:0',
                'location' => 'sometimes|string',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'is_active' => 'sometimes|boolean',
            ]);

            $service->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Service updated successfully',
                'data' => $service
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified service
     */
    public function destroy(Service $service)
    {
        if ($service->worker_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $service->delete();
            return response()->json([
                'success' => true,
                'message' => 'Service deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle service active status
     */
    public function toggle(Service $service)
    {
        if ($service->worker_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $service->update(['is_active' => !$service->is_active]);
            return response()->json([
                'success' => true,
                'message' => 'Service toggled successfully',
                'data' => $service
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve service (admin only)
     */
    public function approve(Service $service)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $service->update([
                'approval_status' => 'approved',
                'approved_at' => now(),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Service approved successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject service (admin only)
     */
    public function reject(Request $request, Service $service)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
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
                'message' => 'Service rejected successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }
}