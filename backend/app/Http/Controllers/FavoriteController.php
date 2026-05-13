<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\User;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:client');
    }

    // Get all favorites for authenticated client
    public function index()
    {
        $favorites = Favorite::where('client_id', auth()->id())
            ->with('worker')
            ->get();

        return response()->json($favorites);
    }

    // Add worker to favorites
    public function store(Request $request)
    {
        $validated = $request->validate([
            'worker_id' => 'required|exists:users,id',
        ]);

        $worker = User::findOrFail($validated['worker_id']);

        if ($worker->role !== 'worker') {
            return response()->json(['message' => 'User is not a worker'], 422);
        }

        $favorite = Favorite::firstOrCreate([
            'client_id' => auth()->id(),
            'worker_id' => $validated['worker_id'],
        ]);

        return response()->json($favorite, 201);
    }

    // Remove worker from favorites
    public function destroy($workerId)
    {
        $favorite = Favorite::where('client_id', auth()->id())
            ->where('worker_id', $workerId)
            ->firstOrFail();

        $favorite->delete();

        return response()->json(['message' => 'Removed from favorites']);
    }

    // Check if worker is in favorites
    public function check($workerId)
    {
        $exists = Favorite::where('client_id', auth()->id())
            ->where('worker_id', $workerId)
            ->exists();

        return response()->json(['is_favorite' => $exists]);
    }
}