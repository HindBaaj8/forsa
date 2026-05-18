<?php

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
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\FeaturedController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\EmailVerificationController;

/*
|--------------------------------------------------------------------------
| CORS Headers (Only for HTTP requests, not for Artisan)
|--------------------------------------------------------------------------
*/
if (php_sapi_name() !== 'cli') {
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
       // header('Access-Control-Allow-Origin: http://localhost:3000');
        //header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        //header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
        http_response_code(200);
        exit();
    }
    
    header('Access-Control-Allow-Origin: http://localhost:3000');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
}

/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
    Route::put('/me', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
    Route::post('/change-password', [AuthController::class, 'changePassword'])->middleware('auth:sanctum');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/send-otp', [AuthController::class, 'sendOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/login-with-otp', [AuthController::class, 'loginWithOtp']);
});

/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD DIRECT ROUTE (without auth prefix)
|--------------------------------------------------------------------------
*/
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

/*
|--------------------------------------------------------------------------
| CATEGORIES ROUTES
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
| SERVICES ROUTES
|--------------------------------------------------------------------------
*/
Route::get('/services/map', [ServiceController::class, 'getMapServices']);
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
| REQUESTS ROUTES
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
| INTERESTS ROUTES
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
| ORDERS ROUTES
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
| CONVERSATIONS & MESSAGES ROUTES
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
| NOTIFICATIONS ROUTES
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
| FAVORITES ROUTES
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
| CLIENT ROUTES
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
| WORKER ROUTES
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum'])->prefix('worker')->group(function () {
    Route::get('/dashboard', [WorkerController::class, 'dashboard']);
    Route::get('/profile', [WorkerController::class, 'profile']);
    Route::put('/profile', [WorkerController::class, 'updateProfile']);
    Route::get('/services', [WorkerController::class, 'services']);
    Route::get('/requests', [WorkerController::class, 'getAvailableRequests']);
    Route::post('/requests/{request}/accept', [WorkerController::class, 'acceptRequest']);
    Route::post('/requests/{request}/reject', [WorkerController::class, 'rejectRequest']);
    Route::post('/requests/{request}/offer', [WorkerController::class, 'submitOffer']);
    Route::get('/orders', [WorkerController::class, 'orders']);
    Route::post('/orders/{order}/accept', [WorkerController::class, 'acceptOrder']);
    Route::post('/orders/{order}/reject', [WorkerController::class, 'rejectOrder']);
    Route::post('/orders/{order}/start', [WorkerController::class, 'startOrder']);
    Route::post('/orders/{order}/complete', [WorkerController::class, 'completeOrder']);
    Route::get('/earnings', [WorkerController::class, 'earnings']);
    Route::get('/schedule', [WorkerController::class, 'schedule']);
    Route::put('/schedule/{id}', [WorkerController::class, 'updateSchedule']);
    Route::put('/notifications', [WorkerController::class, 'updateNotifications']);
});

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    
    // Users
    Route::get('/users', [AdminController::class, 'users']);
    Route::put('/users/{user}/ban', [AdminController::class, 'banUser']);
    Route::put('/users/{user}/activate', [AdminController::class, 'activateUser']);
    Route::get('/workers', [AdminController::class, 'workers']);
    Route::put('/workers/{worker}/approve', [AdminController::class, 'approveWorker']);
    Route::get('/finance', [AdminController::class, 'finance']);
    
    // Alerts
    Route::get('/alerts', [AdminController::class, 'alerts']);
    Route::post('/alerts/{id}/resolve', [AdminController::class, 'resolveAlert']);
    Route::delete('/alerts/{id}', [AdminController::class, 'deleteAlert']);
    
    // Reports
    Route::get('/reports', [AdminController::class, 'reports']);
});

/*
|--------------------------------------------------------------------------
| UPLOAD AVATAR ROUTES
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->post('/upload/avatar', function (Request $request) {
    $request->validate([
        'avatar' => 'required|image|mimes:jpg,jpeg,png,gif|max:2048'
    ]);
    
    $user = $request->user();
    
    if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
        Storage::disk('public')->delete($user->avatar);
    }
    
    $path = $request->file('avatar')->store('avatars', 'public');
    $user->update(['avatar' => $path]);
    
    return response()->json([
        'success' => true,
        'avatar_url' => $path
    ]);
});

Route::middleware('auth:sanctum')->delete('/upload/avatar', function (Request $request) {
    $user = $request->user();
    
    if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
        Storage::disk('public')->delete($user->avatar);
    }
    
    $user->update(['avatar' => null]);
    
    return response()->json(['success' => true]);
});

/*
|--------------------------------------------------------------------------
| PAYMENTS ROUTES
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('payments')->group(function () {
    Route::get('/', [PaymentController::class, 'index']);
    Route::get('/order/{order}', [PaymentController::class, 'getByOrder']);
    Route::post('/create-intent', [PaymentController::class, 'createPaymentIntent']);
    Route::post('/confirm', [PaymentController::class, 'confirmPayment']);
    Route::get('/status/{order}', [PaymentController::class, 'status']);
});
Route::post('/broadcasting/auth', function () {
    return response()->json(['auth' => 'ok']);
});
// ===================== OTP RESET PASSWORD (SECURE) =====================
// ===================== OTP RESET PASSWORD =====================
Route::post('/auth/password/otp/request', [AuthController::class, 'sendOtpReset']);
Route::post('/auth/password/otp/verify', [AuthController::class, 'verifyOtpOnly']);
Route::post('/auth/password/otp/reset', [AuthController::class, 'resetPasswordWithOtp']);

// Email Verification
Route::post('/auth/email/verify', [EmailVerificationController::class, 'verify']);
Route::post('/auth/email/resend', [EmailVerificationController::class, 'resend']);

// Premium Features
Route::middleware('auth:sanctum')->prefix('premium')->group(function () {
    Route::get('/stats', [PremiumController::class, 'getStats']);
    Route::post('/subscribe', [PremiumController::class, 'subscribe']);
    Route::get('/status', [PremiumController::class, 'status']);
});

// Geolocalisation
Route::get('/services/nearby', [LocationController::class, 'nearby']);
Route::get('/workers/nearby', [LocationController::class, 'workersNearby']);

// Subscriptions
Route::middleware('auth:sanctum')->prefix('subscriptions')->group(function () {
    Route::get('/plans', [SubscriptionController::class, 'plans']);
    Route::post('/checkout', [SubscriptionController::class, 'checkout']);
    Route::post('/webhook', [SubscriptionController::class, 'webhook']);
});

// Featured Routes
Route::middleware('auth:sanctum')->prefix('featured')->group(function () {
    Route::get('/pricing', [FeaturedController::class, 'pricing']);
    Route::post('/purchase', [FeaturedController::class, 'purchase']);
    Route::get('/services', [FeaturedController::class, 'getFeaturedServices']);
});

// Konnect Webhook (بدون middleware)
Route::post('/payments/webhook', [PaymentController::class, 'webhook']);

// Payments Routes
Route::middleware('auth:sanctum')->prefix('payments')->group(function () {
    Route::post('/card/create', [PaymentController::class, 'createCardPayment']);
    Route::post('/manual/request', [PaymentController::class, 'requestManualPayment']);
    Route::post('/manual/upload', [PaymentController::class, 'uploadReceipt']);
});

// Admin approve manual payment
Route::middleware(['auth:sanctum', 'admin'])->post('/payments/manual/approve/{paymentId}', [PaymentController::class, 'approveManualPayment']);

Route::get('/featured/check-expired', [FeaturedController::class, 'checkExpired']);
// Admin - جلب الدفعات اليدوية المعلقة
Route::middleware(['auth:sanctum', 'admin'])->get('/admin/payments/manual/pending', [PaymentController::class, 'getPendingManualPayments']);

// رفض الدفع اليدوي
Route::middleware(['auth:sanctum', 'admin'])->post('/payments/manual/reject/{paymentId}', [PaymentController::class, 'rejectManualPayment']);
// Premium routes for workers
Route::middleware(['auth:sanctum', 'premium'])->prefix('premium/worker')->group(function () {
    Route::get('/unlimited-requests', [WorkerController::class, 'getUnlimitedRequests']);
    Route::post('/offers/unlimited/{requestId}', [WorkerController::class, 'submitUnlimitedOffer']);
    Route::get('/analytics', [WorkerController::class, 'premiumAnalytics']);
    Route::get('/services/stats', [WorkerController::class, 'servicesAnalytics']);
});

// Premium Routes (Konnect)
Route::middleware(['auth:sanctum'])->prefix('premium')->group(function () {
    Route::get('/plans', [App\Http\Controllers\PremiumController::class, 'plans']);
    Route::post('/card-payment', [App\Http\Controllers\PremiumController::class, 'createCardPayment']);
    Route::post('/manual-request', [App\Http\Controllers\PremiumController::class, 'requestManualPayment']);
    Route::post('/upload-receipt', [App\Http\Controllers\PremiumController::class, 'uploadReceipt']);
    Route::get('/status', [App\Http\Controllers\PremiumController::class, 'checkStatus']);
    Route::get('/my-payments', [App\Http\Controllers\PremiumController::class, 'myPayments']);
});

// Premium Webhook (بدون middleware)
Route::post('/premium/webhook', [App\Http\Controllers\PremiumController::class, 'webhook']);

// Admin: الموافقة على دفع يدوي
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin/premium')->group(function () {
    Route::post('/approve/{paymentId}', [App\Http\Controllers\PremiumController::class, 'approveManualPayment']);
    Route::post('/reject/{paymentId}', [App\Http\Controllers\PremiumController::class, 'rejectManualPayment']);
});