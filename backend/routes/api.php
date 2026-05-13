<?php

// 🔥 حل مشكلة CORS
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: http://localhost:3000');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
    http_response_code(200);
    exit();
}

// headers عادية
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ServiceRequestController;
use App\Http\Controllers\InterestController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\WorkerController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PaymentController; // 🔥 أضف هذا في الأعلى


/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
    Route::put('/me', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
    Route::post('/change-password', [AuthController::class, 'changePassword'])->middleware('auth:sanctum');
});

/*
|--------------------------------------------------------------------------
| CATEGORIES
|--------------------------------------------------------------------------
*/
Route::get('/categories', [CategoryController::class, 'index']);
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| SERVICES
|--------------------------------------------------------------------------
*/
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{service}', [ServiceController::class, 'show']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{service}', [ServiceController::class, 'update']);
    Route::delete('/services/{service}', [ServiceController::class, 'destroy']);
    Route::patch('/services/{service}/toggle', [ServiceController::class, 'toggle']);
});
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/services/{service}/approve', [ServiceController::class, 'approve']);
    Route::post('/services/{service}/reject', [ServiceController::class, 'reject']);
});

/*
|--------------------------------------------------------------------------
| REQUESTS
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('requests')->group(function () {
    Route::get('/', [ServiceRequestController::class, 'index']);
    Route::get('/{serviceRequest}', [ServiceRequestController::class, 'show']);
    Route::post('/', [ServiceRequestController::class, 'store']);
    Route::put('/{serviceRequest}', [ServiceRequestController::class, 'update']);
    Route::delete('/{serviceRequest}', [ServiceRequestController::class, 'destroy']);
    Route::post('/{serviceRequest}/cancel', [ServiceRequestController::class, 'cancel']);
});

/*
|--------------------------------------------------------------------------
| INTERESTS
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/requests/{requestId}/interests', [InterestController::class, 'index']);
    Route::post('/requests/{requestId}/interests', [InterestController::class, 'store']);
    Route::post('/interests/{interest}/accept', [InterestController::class, 'accept']);
    Route::post('/interests/{interest}/reject', [InterestController::class, 'reject']);
});

/*
|--------------------------------------------------------------------------
| ORDERS
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('orders')->group(function () {
    Route::get('/', [OrderController::class, 'index']);
    Route::get('/{order}', [OrderController::class, 'show']);
    Route::post('/{order}/start', [OrderController::class, 'start']);
    Route::post('/{order}/complete', [OrderController::class, 'complete']);
    Route::post('/{order}/cancel', [OrderController::class, 'cancel']);
});

/*
|--------------------------------------------------------------------------
| CONVERSATIONS & MESSAGES
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('conversations')->group(function () {
    Route::get('/', [ConversationController::class, 'index']);
    Route::post('/', [ConversationController::class, 'store']);
    Route::get('/{conversation}', [ConversationController::class, 'show']);
    Route::get('/by-order/{order}', [ConversationController::class, 'getByOrder']);
    Route::get('/{conversation}/messages', [MessageController::class, 'index']);
    Route::post('/{conversation}/messages', [MessageController::class, 'store']);
    Route::post('/{conversation}/read-all', [MessageController::class, 'markAllAsRead']);
});
Route::middleware('auth:sanctum')->post('/messages/{message}/read', [MessageController::class, 'markAsRead']);

/*
|--------------------------------------------------------------------------
| NOTIFICATIONS
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/{notification}', [NotificationController::class, 'destroy']);
});

/*
|--------------------------------------------------------------------------
| FAVORITES
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('favorites')->group(function () {
    Route::get('/', [FavoriteController::class, 'index']);
    Route::post('/{workerId}', [FavoriteController::class, 'store']);
    Route::delete('/{workerId}', [FavoriteController::class, 'destroy']);
    Route::get('/check/{workerId}', [FavoriteController::class, 'check']);
});

/*
|--------------------------------------------------------------------------
| CLIENT
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum'])->prefix('client')->group(function () {
    Route::get('/dashboard', [ClientController::class, 'dashboard']);
    Route::get('/requests', [ClientController::class, 'requests']);
    Route::get('/workers/search', [ClientController::class, 'searchWorkers']);
    Route::get('/workers/filters', [ClientController::class, 'getFilters']);
});

/*
|--------------------------------------------------------------------------
| /*
|--------------------------------------------------------------------------
| WORKER
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum'])->prefix('worker')->group(function () {
    // Dashboard & Profile
    Route::get('/dashboard', [WorkerController::class, 'dashboard']);
    Route::get('/profile', [WorkerController::class, 'profile']);
    Route::put('/profile', [WorkerController::class, 'updateProfile']);
    
    // Services
    Route::get('/services', [WorkerController::class, 'services']);
    
    // 🔥 الطلبات المتاحة (من العملاء)
    Route::get('/requests', [WorkerController::class, 'getAvailableRequests']);
    Route::post('/requests/{request}/accept', [WorkerController::class, 'acceptRequest']);
    Route::post('/requests/{request}/reject', [WorkerController::class, 'rejectRequest']);
    Route::post('/requests/{request}/offer', [WorkerController::class, 'submitOffer']);
    
    // Orders
    Route::get('/orders', [WorkerController::class, 'orders']);
    Route::post('/orders/{order}/accept', [WorkerController::class, 'acceptOrder']);
    Route::post('/orders/{order}/reject', [WorkerController::class, 'rejectOrder']);
    Route::post('/orders/{order}/start', [WorkerController::class, 'startOrder']);
    Route::post('/orders/{order}/complete', [WorkerController::class, 'completeOrder']);
    
    // Earnings & Schedule
    Route::get('/earnings', [WorkerController::class, 'earnings']);
    Route::get('/schedule', [WorkerController::class, 'schedule']);
    Route::put('/schedule/{id}', [WorkerController::class, 'updateSchedule']);
    
    // Notifications
    Route::put('/notifications', [WorkerController::class, 'updateNotifications']);
});

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::put('/users/{user}/ban', [AdminController::class, 'banUser']);
    Route::put('/users/{user}/activate', [AdminController::class, 'activateUser']);
    Route::get('/workers', [AdminController::class, 'workers']);
    Route::put('/workers/{worker}/approve', [AdminController::class, 'approveWorker']);
    Route::get('/finance', [AdminController::class, 'finance']);
    Route::get('/reports', [AdminController::class, 'reports']);
});

//payament
Route::middleware('auth:sanctum')->prefix('payments')->group(function () {
    Route::get('/', [PaymentController::class, 'index']);
    Route::get('/order/{order}', [PaymentController::class, 'getByOrder']);
    Route::post('/create-intent', [PaymentController::class, 'createPaymentIntent']);
    Route::post('/confirm', [PaymentController::class, 'confirmPayment']);
    Route::get('/status/{order}', [PaymentController::class, 'status']);
});