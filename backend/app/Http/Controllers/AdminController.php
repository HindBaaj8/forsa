<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Service;
use App\Models\ServiceRequest;
use App\Models\Order;
use App\Models\Category;
use App\Models\Report;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:admin');
    }

    /**
 * قائمة المستخدمين
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

    $users = $query->latest()->paginate(10);
    return response()->json($users);
}
    /**
     * Dashboard - الإحصائيات العامة
     */
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
        'totalRevenue' => Order::where('status', 'completed')->sum('agreed_price') ?? 0,
    ];

    $recentUsers = User::latest()->take(5)->get();
    // ✅ أصلح هذه السطر - استخدم client فقط
    $recentRequests = ServiceRequest::with('client')->latest()->take(5)->get()->map(function($request) {
        return [
            'id' => $request->id,
            'title' => $request->title,
            'client_name' => $request->client->full_name ?? $request->client->first_name . ' ' . $request->client->last_name,
            'budget' => $request->budget,
            'status' => $request->status,
            'created_at' => $request->created_at,
        ];
    });

    return response()->json([
        'stats' => $stats,
        'recentUsers' => $recentUsers,
        'recentRequests' => $recentRequests,
    ]);
}

    /**
     * stats - نفس dashboard (للتوافق مع Frontend)
     */
    public function stats()
    {
        return $this->dashboard();
    }

    /**
     * قائمة المستخدمين
     */
   /**
 * قائمة الطلبات
 */
public function requests()
{
    // ✅ استخدم العلاقات الموجودة فقط (client, category, interests, order)
    $requests = ServiceRequest::with(['client', 'category'])->latest()->get();
    
    // تنسيق البيانات للـ Frontend
    $formatted = $requests->map(function($request) {
        return [
            'id' => $request->id,
            'title' => $request->title,
            'description' => $request->description,
            'client_name' => $request->client->full_name ?? $request->client->first_name . ' ' . $request->client->last_name,
            'client_id' => $request->client_id,
            'budget' => $request->budget,
            'city' => $request->city,
            'category' => $request->category->name ?? null,
            'category_id' => $request->category_id,
            'visibility' => $request->visibility,
            'status' => $request->status,
            'created_at' => $request->created_at,
            'updated_at' => $request->updated_at,
        ];
    });
    
    return response()->json(['data' => $formatted]);
}

    /**
     * حظر مستخدم
     */
    public function banUser(User $user)
    {
        $user->update(['status' => 'blocked']);
        return response()->json(['message' => 'User banned successfully', 'user' => $user]);
    }

    /**
     * تفعيل مستخدم
     */
    public function activateUser(User $user)
    {
        $user->update(['status' => 'active']);
        return response()->json(['message' => 'User activated successfully', 'user' => $user]);
    }

    /**
     * حذف مستخدم
     */
    public function deleteUser(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * قائمة العمال
     */
    public function workers(Request $request)
    {
        $query = User::where('role', 'worker');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $workers = $query->latest()->paginate(9);
        return response()->json($workers);
    }

    /**
     * قبول عامل
     */
    public function approveWorker(User $worker)
    {
        if ($worker->role !== 'worker') {
            return response()->json(['message' => 'User is not a worker'], 422);
        }

        $worker->update(['status' => 'active']);
        return response()->json(['message' => 'Worker approved successfully', 'worker' => $worker]);
    }

    /**
     * حظر عامل
     */
    public function banWorker(User $worker)
    {
        if ($worker->role !== 'worker') {
            return response()->json(['message' => 'User is not a worker'], 422);
        }
        $worker->update(['status' => 'blocked']);
        return response()->json(['message' => 'Worker banned successfully', 'worker' => $worker]);
    }

    /**
     * حذف عامل
     */
    public function deleteWorker(User $worker)
    {
        if ($worker->role !== 'worker') {
            return response()->json(['message' => 'User is not a worker'], 422);
        }
        $worker->delete();
        return response()->json(['message' => 'Worker deleted successfully']);
    }

    /**
     * قائمة الطلبات
     */
    

    /**
     * تحديث حالة الطلب
     */
    public function updateRequestStatus(Request $request, $id)
    {
        $serviceRequest = ServiceRequest::findOrFail($id);
        $serviceRequest->update(['status' => $request->status]);
        return response()->json(['message' => 'Request status updated successfully', 'data' => $serviceRequest]);
    }

    /**
     * حذف طلب
     */
    public function deleteRequest($id)
    {
        $serviceRequest = ServiceRequest::findOrFail($id);
        $serviceRequest->delete();
        return response()->json(['message' => 'Request deleted successfully']);
    }

    /**
     * قائمة الفئات
     */
    public function categories()
    {
        $categories = Category::withCount(['services', 'requests'])->get();
        return response()->json(['data' => $categories]);
    }

    /**
     * إضافة فئة جديدة
     */
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

    /**
     * تحديث فئة
     */
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

    /**
     * حذف فئة
     */
    public function deleteCategory(Category $category)
    {
        $category->delete();
        return response()->json(['message' => 'Category deleted successfully']);
    }

    /**
     * تفعيل/تعطيل فئة
     */
    public function toggleCategory(Category $category)
    {
        $category->update(['is_active' => !$category->is_active]);
        return response()->json($category);
    }

    /**
     * الإحصائيات المالية
     */
public function finance()
{
    $stats = [
        'totalRevenue' => Order::where('status', 'completed')->sum('agreed_price') ?? 0,
        'paidToWorkers' => 0,
        'netProfit' => 0,
        'todayTransactions' => Order::whereDate('created_at', today())->count(),
    ];

    $transactions = Order::with(['client', 'worker'])
        ->where('status', 'completed')
        ->latest()
        ->take(20)
        ->get()
        ->map(function($order) {
            // ✅ تأكد من وجود request
            $requestTitle = optional($order->request)->title ?? 'Order #' . $order->id;
            
            return [
                'id' => $order->id,
                'description' => $requestTitle,
                'client_name' => optional($order->client)->full_name ?? '',
                'worker_name' => optional($order->worker)->full_name ?? '',
                'amount' => $order->agreed_price,
                'type' => 'in',
                'method' => 'stripe',
                'date' => $order->created_at->format('Y-m-d'),
                'status' => 'completed',
            ];
        });

    return response()->json([
        'stats' => $stats,
        'transactions' => $transactions,
    ]);
}

    /**
     * التنبيهات
     */
    public function alerts()
    {
        return response()->json(['data' => []]);
    }

    /**
     * حل تنبيه
     */
    public function resolveAlert($id)
    {
        return response()->json(['message' => 'Alert resolved successfully']);
    }

    /**
     * حذف تنبيه
     */
    public function deleteAlert($id)
    {
        return response()->json(['message' => 'Alert deleted successfully']);
    }

    /**
     * التقارير
     */
    public function reports()
    {
        $reports = Report::with(['reporter', 'reported'])->latest()->get();
        return response()->json(['data' => $reports]);
    }

    /**
     * حل تقرير
     */
    public function resolveReport($id)
    {
        $report = Report::findOrFail($id);
        $report->update(['status' => 'resolved']);
        return response()->json(['message' => 'Report resolved successfully']);
    }

    /**
     * الخدمات المعلقة
     */
    public function pendingServices()
    {
        $services = Service::where('approval_status', 'pending')->latest()->get();
        return response()->json(['data' => $services]);
    }
}