<?php

namespace App\Http\Controllers;

use App\Models\ServiceRequest;
use App\Models\Favorite;
use App\Models\User;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash; // 🔥 أضف هذا

class ClientController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:client');
    }

    public function dashboard()
    {
        $userId = auth()->id();

        $stats = [
            'activeRequests' => ServiceRequest::where('client_id', $userId)
                ->whereIn('status', ['pending', 'in_discussion'])
                ->count(),
            'completedRequests' => ServiceRequest::where('client_id', $userId)
                ->where('status', 'completed')
                ->count(),
            'totalSpent' => 0,
            'favorites' => Favorite::where('client_id', $userId)->count(),
        ];

        $recentRequests = ServiceRequest::where('client_id', $userId)
            ->with('category')
            ->latest()
            ->take(5)
            ->get();

        $featuredWorkers = User::where('role', 'worker')
            ->where('status', 'active')
            ->withCount('services')
            ->having('services_count', '>', 0)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'recentRequests' => $recentRequests,
            'featuredWorkers' => $featuredWorkers,
        ]);
    }

    /**
     * 🔥🔥🔥 أضف هذه الدالة -最重要的是 🔥🔥🔥
     * Get client requests (طلبات العميل)
     */
    public function requests()
    {
        try {
            $userId = auth()->id();
            
            $requests = ServiceRequest::where('client_id', $userId)
                ->with('category')
                ->latest()
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $requests,
                'total' => $requests->count()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔥 Search workers (بحث عن عمال)
     */
    public function searchWorkers(Request $request)
    {
        $query = User::where('role', 'worker')
            ->where('status', 'active');
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'LIKE', "%{$search}%")
                  ->orWhere('last_name', 'LIKE', "%{$search}%")
                  ->orWhere('city', 'LIKE', "%{$search}%");
            });
        }
        
        if ($request->has('category_id')) {
            $query->whereHas('services', function($q) use ($request) {
                $q->where('category_id', $request->category_id);
            });
        }
        
        if ($request->has('city')) {
            $query->where('city', $request->city);
        }
        
        $workers = $query->paginate(20);
        
        return response()->json($workers);
    }

    /**
     * 🔥 Get filters for search (فلاتر البحث)
     */
    public function getFilters()
    {
        $categories = \App\Models\Category::all();
        $cities = User::where('role', 'worker')
            ->whereNotNull('city')
            ->distinct()
            ->pluck('city');
        
        return response()->json([
            'categories' => $categories,
            'cities' => $cities
        ]);
    }

    public function favorites()
    {
        $favorites = Favorite::where('client_id', auth()->id())
            ->with('worker')
            ->get()
            ->pluck('worker');

        return response()->json($favorites);
    }

    public function addFavorite($workerId)
    {
        $worker = User::where('role', 'worker')->findOrFail($workerId);

        $favorite = Favorite::firstOrCreate([
            'client_id' => auth()->id(),
            'worker_id' => $workerId,
        ]);

        return response()->json($favorite, 201);
    }

    public function removeFavorite($workerId)
    {
        $favorite = Favorite::where('client_id', auth()->id())
            ->where('worker_id', $workerId)
            ->firstOrFail();

        $favorite->delete();

        return response()->json(['message' => 'Removed from favorites']);
    }

    public function profile()
    {
        return response()->json(auth()->user());
    }

    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'city' => 'sometimes|string|max:255',
            'avatar' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $path;
        }

        $user->update($validated);

        return response()->json($user);
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = auth()->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json(['message' => 'Password changed successfully']);
    }
}