<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Order;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    // Get reviews for a worker
    public function index($workerId)
    {
        $reviews = Review::where('worker_id', $workerId)
            ->with('client')
            ->latest()
            ->paginate(10);

        $averageRating = Review::where('worker_id', $workerId)->avg('rating');

        return response()->json([
            'reviews' => $reviews,
            'average_rating' => round($averageRating, 1),
            'total_reviews' => Review::where('worker_id', $workerId)->count(),
        ]);
    }

    // Create a review for completed order
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        // Check if user is the client of this order
        if ($order->client_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if order is completed
        if ($order->status !== 'completed') {
            return response()->json(['message' => 'You can only review completed orders'], 400);
        }

        // Check if already reviewed
        $existingReview = Review::where('order_id', $validated['order_id'])
            ->where('client_id', auth()->id())
            ->first();

        if ($existingReview) {
            return response()->json(['message' => 'You already reviewed this order'], 422);
        }

        $review = Review::create([
            'order_id' => $validated['order_id'],
            'client_id' => auth()->id(),
            'worker_id' => $order->worker_id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        // Update worker's average rating
        $averageRating = Review::where('worker_id', $order->worker_id)->avg('rating');
        $totalReviews = Review::where('worker_id', $order->worker_id)->count();

        $order->worker->update([
            'rating' => round($averageRating, 2),
            'total_reviews' => $totalReviews,
        ]);

        return response()->json($review, 201);
    }

    // Update review
    public function update(Request $request, Review $review)
    {
        if ($review->client_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review->update($validated);

        // Update worker's average rating
        $averageRating = Review::where('worker_id', $review->worker_id)->avg('rating');
        $review->worker->update(['rating' => round($averageRating, 2)]);

        return response()->json($review);
    }

    // Delete review
    public function destroy(Review $review)
    {
        if ($review->client_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $workerId = $review->worker_id;
        $review->delete();

        // Update worker's average rating
        $averageRating = Review::where('worker_id', $workerId)->avg('rating');
        $totalReviews = Review::where('worker_id', $workerId)->count();

        User::where('id', $workerId)->update([
            'rating' => round($averageRating, 2),
            'total_reviews' => $totalReviews,
        ]);

        return response()->json(['message' => 'Review deleted']);
    }
}