<?php

namespace App\Http\Controllers;

use App\Models\ServiceRequest;
use App\Models\Favorite;
use App\Models\User;
use App\Models\Review;
use Illuminate\Http\Request;

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
            'totalSpent' => 0, // Will be calculated from payments
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