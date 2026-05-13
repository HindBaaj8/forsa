<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::with('worker', 'category')
            ->where('approval_status', 'approved')
            ->where('is_active', true);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('city')) {
            $query->where('location', 'like', '%' . $request->city . '%');
        }

        $services = $query->latest()->paginate(20);
        return response()->json($services);
    }

    public function show(Service $service)
    {
        if ($service->approval_status !== 'approved') {
            return response()->json(['message' => 'Service not found'], 404);
        }
        return response()->json($service->load('worker', 'category'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'location' => 'required|string',
        ]);

        $service = Service::create([
            'worker_id' => auth()->id(),
            'category_id' => $request->category_id,
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'location' => $request->location,
            'approval_status' => 'pending',
            'is_active' => true,
        ]);

        return response()->json($service, 201);
    }

    public function update(Request $request, Service $service)
    {
        if ($service->worker_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'location' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $service->update($request->only(['title', 'description', 'price', 'location', 'is_active']));
        return response()->json($service);
    }

    public function destroy(Service $service)
    {
        if ($service->worker_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $service->delete();
        return response()->json(['message' => 'Service deleted']);
    }

    public function approve(Service $service)
    {
        $service->update([
            'approval_status' => 'approved',
            'approved_at' => now(),
        ]);
        return response()->json(['message' => 'Service approved']);
    }

    public function reject(Request $request, Service $service)
    {
        $request->validate(['reason' => 'required|string']);
        $service->update([
            'approval_status' => 'rejected',
            'rejection_reason' => $request->reason,
        ]);
        return response()->json(['message' => 'Service rejected']);
    }
}