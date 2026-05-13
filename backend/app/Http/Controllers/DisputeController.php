<?php

namespace App\Http\Controllers;

use App\Models\Dispute;
use App\Models\Order;
use App\Models\DisputeEvidence;
use Illuminate\Http\Request;

class DisputeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    // Get disputes for authenticated user
    public function index()
    {
        $user = auth()->user();
        
        $disputes = Dispute::whereHas('order', function($query) use ($user) {
            $query->where('client_id', $user->id)
                  ->orWhere('worker_id', $user->id);
        })
        ->with('order', 'raisedBy')
        ->latest()
        ->paginate(20);

        return response()->json($disputes);
    }

    // Create a dispute
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'reason' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        // Check if user is part of the order
        if (!in_array(auth()->id(), [$order->client_id, $order->worker_id])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if order can be disputed
        if (!in_array($order->status, ['accepted', 'in_progress'])) {
            return response()->json(['message' => 'Order cannot be disputed at this stage'], 400);
        }

        // Check if dispute already exists
        $existingDispute = Dispute::where('order_id', $order->id)->first();
        if ($existingDispute) {
            return response()->json(['message' => 'A dispute already exists for this order'], 422);
        }

        $dispute = Dispute::create([
            'order_id' => $validated['order_id'],
            'raised_by' => auth()->id(),
            'reason' => $validated['reason'],
            'description' => $validated['description'],
            'status' => 'pending',
        ]);

        // Update order status
        $order->update(['status' => 'disputed']);

        return response()->json($dispute, 201);
    }

    // Get dispute details
    public function show(Dispute $dispute)
    {
        $user = auth()->user();
        $order = $dispute->order;

        if (!in_array($user->id, [$order->client_id, $order->worker_id]) && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($dispute->load('order', 'raisedBy', 'evidence'));
    }

    // Add evidence to dispute
    public function addEvidence(Request $request, Dispute $dispute)
    {
        $order = $dispute->order;

        if (!in_array(auth()->id(), [$order->client_id, $order->worker_id])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'type' => 'required|string|in:image,file,chat',
            'description' => 'nullable|string|max:500',
            'visibility' => 'sometimes|in:admin_only,both_parties',
        ]);

        $evidence = DisputeEvidence::create([
            'dispute_id' => $dispute->id,
            'submitted_by' => auth()->id(),
            'type' => $validated['type'],
            'path' => $request->hasFile('file') 
                ? $request->file('file')->store('disputes', 'public') 
                : $request->path,
            'description' => $validated['description'],
            'visibility' => $validated['visibility'] ?? 'admin_only',
        ]);

        return response()->json($evidence, 201);
    }

    // Get all disputes (admin only)
    public function all()
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $disputes = Dispute::with('order', 'raisedBy')
            ->latest()
            ->paginate(20);

        return response()->json($disputes);
    }

    // Resolve dispute (admin only)
    public function resolve(Request $request, Dispute $dispute)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'decision' => 'required|in:for_client,for_worker,partial',
            'resolution_amount' => 'required_if:decision,partial|nullable|numeric|min:0',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $dispute->resolve(
            $validated['decision'],
            $validated['resolution_amount'] ?? null,
            $validated['admin_notes'] ?? null
        );

        return response()->json(['message' => 'Dispute resolved successfully']);
    }

    // Get dispute statistics (admin only)
    public function stats()
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $stats = [
            'total' => Dispute::count(),
            'pending' => Dispute::where('status', 'pending')->count(),
            'under_review' => Dispute::where('status', 'under_review')->count(),
            'resolved' => Dispute::where('status', 'resolved')->count(),
            'closed' => Dispute::where('status', 'closed')->count(),
        ];

        return response()->json($stats);
    }
}