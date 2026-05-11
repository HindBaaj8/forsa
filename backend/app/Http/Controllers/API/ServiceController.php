<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ServiceController extends Controller
{
    // Get all services (for clients)
    public function index(Request $request)
    {
        $query = Service::with('worker')->where('status', 'active');
        
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        if ($request->has('city')) {
            $query->where('city', $request->city);
        }
        
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }
        
        $services = $query->latest()->paginate(20);
        
        return response()->json([
            'status' => 'success',
            'data' => $services
        ]);
    }
    
    // Get single service
    public function show($id)
    {
        $service = Service::with('worker')->findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $service
        ]);
    }
    
    // Create new service (worker only)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'city' => 'required|string|max:100',
            'images' => 'nullable|array',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $service = Service::create([
            'worker_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'price' => $request->price,
            'city' => $request->city,
            'images' => $request->images ?? [],
            'status' => 'active',
        ]);
        
        // ✅ نفس البنية المستخدمة في myServices
        return response()->json([
            'status' => 'success',
            'message' => 'Service created successfully',
            'data' => $service  // ✅ استخدم 'data' بدل 'service'
        ], 201);
    }
    
    // Update service (worker only, own service)
    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);
        
        if ($service->worker_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'category' => 'sometimes|string|max:100',
            'price' => 'sometimes|numeric|min:0',
            'city' => 'sometimes|string|max:100',
            'status' => 'sometimes|in:active,inactive',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $service->update($request->only([
            'title', 'description', 'category', 'price', 'city', 'status'
        ]));
        
        if ($request->has('images')) {
            $service->images = $request->images;
            $service->save();
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Service updated successfully',
            'data' => $service  // ✅ استخدم 'data'
        ]);
    }
    
    // Delete service (worker only, own service)
    public function destroy(Request $request, $id)
    {
        $service = Service::findOrFail($id);
        
        if ($service->worker_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $service->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Service deleted successfully'
        ]);
    }
    
    // ✅ Get worker services (for worker dashboard) - المصحح
    public function myServices(Request $request)
    {
        $services = Service::where('worker_id', $request->user()->id)
            ->latest()
            ->get();  // ✅ استخدم get() بدل paginate() للبساطة
        
        return response()->json([
            'status' => 'success',
            'data' => $services  // ✅ نفس البنية
        ]);
    }
    
    // Search workers (for clients)
    public function search(Request $request)
    {
        $query = User::where('role', 'worker')
            ->where('status', 'active')
            ->with('services');
        
        if ($request->has('query') && !empty($request->query)) {
            $query->where(function($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->query . '%')
                  ->orWhere('last_name', 'like', '%' . $request->query . '%')
                  ->orWhereHas('services', function($sq) use ($request) {
                      $sq->where('title', 'like', '%' . $request->query . '%');
                  });
            });
        }
        
        if ($request->has('category') && !empty($request->category)) {
            $query->whereHas('services', function($q) use ($request) {
                $q->where('category', $request->category);
            });
        }
        
        if ($request->has('city') && !empty($request->city)) {
            $query->where('city', $request->city);
        }
        
        $workers = $query->paginate(20);
        
        return response()->json([
            'status' => 'success',
            'workers' => $workers
        ]);
    }
    
    // Get filters (categories and cities)
    public function filters()
    {
        $categories = Service::where('status', 'active')
            ->distinct()
            ->pluck('category');
        
        $cities = User::where('role', 'worker')
            ->whereNotNull('city')
            ->distinct()
            ->pluck('city');
        
        return response()->json([
            'status' => 'success',
            'categories' => $categories,
            'cities' => $cities
        ]);
    }
}