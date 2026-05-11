<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Request;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use App\Models\Favorite;
use App\Events\DataUpdated;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    // Dashboard للعميل (Client)
    public function clientDashboard(HttpRequest $request)
    {
        $user = $request->user();
        
        // الإحصائيات
        $stats = [
            'activeRequests' => Request::where('client_id', $user->id)
                ->whereIn('status', ['active', 'in_progress', 'pending'])
                ->count(),
            'completedRequests' => Request::where('client_id', $user->id)
                ->where('status', 'completed')
                ->count(),
            'totalSpent' => Order::where('client_id', $user->id)
                ->where('status', 'completed')
                ->sum('price'),
            'favorites' => Favorite::where('client_id', $user->id)->count(),
        ];
        
        // آخر الطلبات
        $recentRequests = Request::where('client_id', $user->id)
            ->with('worker')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function($req) {
                return [
                    'id' => $req->id,
                    'service_name' => $req->title,
                    'city' => $req->city,
                    'price' => $req->budget,
                    'status' => $req->status,
                    'time_ago' => $req->created_at->diffForHumans(),
                    'worker_name' => $req->worker ? $req->worker->first_name . ' ' . $req->worker->last_name : null,
                ];
            });
        
        // مهنيون مميزون
        $featuredWorkers = User::where('role', 'worker')
            ->where('status', 'active')
            ->withCount('services')
            ->orderBy('rating', 'desc')
            ->limit(5)
            ->get()
            ->map(function($worker) {
                return [
                    'id' => $worker->id,
                    'name' => $worker->first_name . ' ' . $worker->last_name,
                    'role' => 'مهني',
                    'city' => $worker->city,
                    'rating' => number_format($worker->rating, 1),
                ];
            });
        
        return response()->json([
            'status' => 'success',
            'stats' => $stats,
            'recentRequests' => $recentRequests,
            'featuredWorkers' => $featuredWorkers,
        ]);
    }
    
    // Dashboard للعامل (Worker)
    public function workerDashboard(HttpRequest $request)
    {
        $user = $request->user();
        
        // الإحصائيات
        $stats = [
            'totalEarnings' => Order::where('worker_id', $user->id)
                ->where('status', 'completed')
                ->sum('price'),
            'completedOrders' => Order::where('worker_id', $user->id)
                ->where('status', 'completed')
                ->count(),
            'pendingOrders' => Order::where('worker_id', $user->id)
                ->where('status', 'pending')
                ->count(),
            'rating' => number_format($user->rating, 1),
            'totalReviews' => $user->total_reviews,
        ];
        
        // آخر الطلبات
        $recentOrders = Order::where('worker_id', $user->id)
            ->with('client')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function($order) {
                return [
                    'id' => $order->id,
                    'client_name' => $order->client ? $order->client->first_name . ' ' . $order->client->last_name : null,
                    'service_name' => $order->service ? $order->service->title : 'خدمة',
                    'date' => $order->created_at->format('Y-m-d'),
                    'price' => $order->price,
                    'status' => $order->status,
                ];
            });
        
        // أفضل الخدمات
        $topServices = Service::where('worker_id', $user->id)
            ->withCount('requests')
            ->orderBy('requests_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function($service) {
                return [
                    'id' => $service->id,
                    'title' => $service->title,
                    'requests_count' => $service->requests_count,
                    'price' => $service->price,
                ];
            });
        
        return response()->json([
            'status' => 'success',
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'topServices' => $topServices,
        ]);
    }
    
    // Dashboard للأدمن (Admin)
    public function adminDashboard()
    {
        $stats = [
            'totalUsers' => User::count(),
            'totalClients' => User::where('role', 'client')->count(),
            'totalWorkers' => User::where('role', 'worker')->count(),
            'totalServices' => Service::count(),
            'totalRequests' => Request::count(),
            'pendingRequests' => Request::where('status', 'pending')->count(),
            'totalOrders' => Order::count(),
            'completedOrders' => Order::where('status', 'completed')->count(),
            'totalRevenue' => Order::where('status', 'completed')->sum('price'),
        ];
        
        $recentUsers = User::latest()->limit(10)->get()->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'created_at' => $user->created_at->format('Y-m-d'),
            ];
        });
        
        $recentRequests = Request::with('client')->latest()->limit(10)->get()->map(function($request) {
            return [
                'id' => $request->id,
                'title' => $request->title,
                'client' => $request->client ? $request->client->first_name . ' ' . $request->client->last_name : null,
                'status' => $request->status,
                'created_at' => $request->created_at->format('Y-m-d'),
            ];
        });
        
        return response()->json([
            'status' => 'success',
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'recentRequests' => $recentRequests,
        ]);
    }
    
    // أرباح العامل (Worker Earnings)
    public function workerEarnings(HttpRequest $request)
    {
        $user = $request->user();
        
        $stats = [
            'totalEarnings' => Order::where('worker_id', $user->id)
                ->where('status', 'completed')
                ->sum('price'),
            'monthlyEarnings' => Order::where('worker_id', $user->id)
                ->where('status', 'completed')
                ->whereMonth('created_at', now()->month)
                ->sum('price'),
            'completedOrders' => Order::where('worker_id', $user->id)
                ->where('status', 'completed')
                ->count(),
            'percentageChange' => $this->calculatePercentageChange($user->id),
        ];
        
        $transactions = Order::where('worker_id', $user->id)
            ->where('status', 'completed')
            ->with('client', 'service')
            ->latest()
            ->paginate(20);
        
        return response()->json([
            'status' => 'success',
            'stats' => $stats,
            'transactions' => $transactions,
        ]);
    }
    
    // حساب نسبة التغيير
    private function calculatePercentageChange($workerId)
    {
        $currentMonth = Order::where('worker_id', $workerId)
            ->where('status', 'completed')
            ->whereMonth('created_at', now()->month)
            ->sum('price');
            
        $lastMonth = Order::where('worker_id', $workerId)
            ->where('status', 'completed')
            ->whereMonth('created_at', now()->subMonth()->month)
            ->sum('price');
            
        if ($lastMonth == 0) return $currentMonth > 0 ? 100 : 0;
        
        return round((($currentMonth - $lastMonth) / $lastMonth) * 100);
    }
}