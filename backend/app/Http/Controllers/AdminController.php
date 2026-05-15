<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\Order;
use App\Models\Category;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:admin');
    }

    public function dashboard()
    {
        $stats = [
            'totalUsers' => User::count(),
            'totalWorkers' => User::where('role', 'worker')->count(),
            'totalClients' => User::where('role', 'client')->count(),
            'totalServices' => Service::where('approval_status', 'approved')->count(),
            'totalRequests' => ServiceRequest::count(),
            'pendingRequests' => ServiceRequest::where('status', 'pending')->count(),
            'completedOrders' => Order::where('status', 'completed')->count(),
            'totalRevenue' => Order::where('status', 'completed')->sum('agreed_price'),
        ];

        $recentUsers = User::latest()->take(5)->get();
        $recentRequests = ServiceRequest::with('client')->latest()->take(5)->get();

        return response()->json([
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'recentRequests' => $recentRequests,
        ]);
    }

    public function users(Request $request)
    {
        $query = User::query();

    if ($request->has('search')) {
        $query->where(function($q) use ($request) {
            $q->where('first_name', 'like', '%' . $request->search . '%')
              ->orWhere('last_name', 'like', '%' . $request->search . '%')
              ->orWhere('email', 'like', '%' . $request->search . '%');
        });
    }

    if ($request->has('role') && $request->role !== 'all') {
        $query->where('role', $request->role);
    }

    if ($request->has('status') && $request->status !== 'all') {
        $query->where('status', $request->status);
    }

        $users = $query->latest()->paginate(10);
        return response()->json($users);
    }

    public function banUser(User $user)
    {
        $user->update(['status' => 'blocked']);
        return response()->json(['message' => 'User banned']);
    }

    public function activateUser(User $user)
    {
        $user->update(['status' => 'active']);
        return response()->json(['message' => 'User activated']);
    }

    public function workers(Request $request)
    {
        $query = User::where('role', 'worker');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $workers = $query->latest()->paginate(9);
        return response()->json($workers);
    }

    public function approveWorker(User $worker)
    {
        $requests = ServiceRequest::with('client', 'category')->latest()->get();
        return response()->json(['success' => true, 'data' => $requests]);
    }

        $worker->update(['status' => 'active']);
        return response()->json(['message' => 'Worker approved']);
    }

    public function categories()
    {
        $categories = Category::withCount(['services', 'requests'])->get();
        return response()->json(['categories' => $categories]);
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'nullable|string',
        ]);

        $slug = \Str::slug($validated['name']);
        $category = Category::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'icon' => $validated['icon'] ?? null,
            'is_active' => true,
        ]);

        return response()->json($category, 201);
    }

    public function updateCategory(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'icon' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = \Str::slug($validated['name']);
        }

        $category->update($validated);
        return response()->json($category);
    }

    public function deleteCategory(Category $category)
    {
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }

    public function toggleCategory(Category $category)
    {
        $category->update(['is_active' => !$category->is_active]);
        return response()->json($category);
    }

    public function finance()
    {
        $stats = [
            'totalRevenue' => Order::where('status', 'completed')->sum('agreed_price'),
            'paidToWorkers' => 0, // Will be calculated from payments
            'netProfit' => 0, // Will be calculated
            'todayTransactions' => Order::whereDate('created_at', today())->count(),
        ];

        $transactions = Order::with('client', 'worker')
            ->where('status', 'completed')
            ->latest()
            ->take(20)
            ->get()
            ->map(function($order) {
                return [
                    'id' => $order->id,
                    'description' => $order->request->title,
                    'client_name' => $order->client->full_name,
                    'worker_name' => $order->worker->full_name,
                    'amount' => $order->agreed_price,
                    'type' => 'in',
                    'method' => 'stripe',
                    'date' => $order->completed_at->format('Y-m-d'),
                    'status' => 'completed',
                ];
            });

        return response()->json([
            'stats' => $stats,
            'transactions' => $transactions,
        ]);
    }

    public function alerts()
    {
        // This will be implemented with notifications table
        $alerts = [];

        return response()->json(['alerts' => $alerts]);
    }

    public function markAlertRead($id)
    {
        // This will be implemented with notifications table
        return response()->json(['message' => 'Alert marked as read']);
    }

    public function deleteAlert($id)
    {
        // This will be implemented with notifications table
        return response()->json(['message' => 'Alert deleted']);
    }
}