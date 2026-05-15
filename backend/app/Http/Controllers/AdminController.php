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

    /**
     * Dashboard statistics
     */
    public function dashboard()
    {
        $stats = [
            'totalUsers' => User::count(),
            'totalWorkers' => User::where('role', 'worker')->count(),
            'totalClients' => User::where('role', 'client')->count(),
            'totalServices' => Service::count(),
            'totalRequests' => ServiceRequest::count(),
            'pendingRequests' => ServiceRequest::where('status', 'pending')->count(),
            'completedOrders' => Order::where('status', 'completed')->count(),
            'totalRevenue' => Order::where('status', 'completed')->sum('agreed_price') ?? 0,
        ];

        $recentUsers = User::latest()->take(5)->get()->map(function($user) {
            return [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'created_at' => $user->created_at,
            ];
        });

        $recentRequests = ServiceRequest::with('client')
            ->latest()
            ->take(5)
            ->get()
            ->map(function($request) {
                return [
                    'id' => $request->id,
                    'title' => $request->title,
                    'client_name' => $request->client?->first_name . ' ' . $request->client?->last_name,
                    'status' => $request->status,
                    'budget' => $request->budget,
                    'city' => $request->city,
                    'created_at' => $request->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'recentRequests' => $recentRequests,
        ]);
    }

    /**
     * Get all users
     */
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

        $users = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Ban user
     */
    public function banUser(User $user)
    {
        $user->update(['status' => 'blocked']);
        return response()->json(['success' => true, 'data' => $user]);
    }

    /**
     * Activate user
     */
    public function activateUser(User $user)
    {
        $user->update(['status' => 'active']);
        return response()->json(['success' => true, 'data' => $user]);
    }

    /**
     * Get all workers
     */
    public function workers()
    {
        $workers = User::where('role', 'worker')->latest()->get();
        return response()->json(['success' => true, 'data' => $workers]);
    }

    /**
     * Get all requests
     */
    public function requests()
    {
        $requests = ServiceRequest::with('client', 'category')->latest()->get();
        return response()->json(['success' => true, 'data' => $requests]);
    }

    /**
     * Get all categories
     */
    public function categories()
    {
        $categories = Category::withCount('services')->get();
        return response()->json(['success' => true, 'data' => $categories]);
    }

    /**
     * Finance statistics
     */
    public function finance()
    {
        $stats = [
            'totalRevenue' => Order::where('status', 'completed')->sum('agreed_price') ?? 0,
            'paidToWorkers' => 0,
            'netProfit' => 0,
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
                    'description' => $order->request->title ?? 'Service',
                    'client_name' => $order->client->first_name . ' ' . $order->client->last_name,
                    'worker_name' => $order->worker->first_name . ' ' . $order->worker->last_name,
                    'amount' => $order->agreed_price,
                    'type' => 'in',
                    'method' => 'stripe',
                    'date' => $order->created_at->format('Y-m-d'),
                    'status' => 'completed',
                ];
            });

        return response()->json([
            'success' => true,
            'stats' => $stats,
            'transactions' => $transactions,
        ]);
    }
}