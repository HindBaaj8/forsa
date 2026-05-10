<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ServiceController;
use App\Http\Controllers\API\RequestController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\MessageController;
use App\Http\Controllers\API\FavoriteController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\PasswordResetController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\ConversationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ==================== PUBLIC ROUTES (بدون توكن) ====================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Forgot Password Public Routes
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);

Route::get('/test', function() {
    return response()->json(['message' => 'API is working!']);
});

// ==================== PROTECTED ROUTES (يحتاج توكن) ====================
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // User Profile
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/user/change-password', [UserController::class, 'changePassword']);
    
    // Services
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{id}', [ServiceController::class, 'show']);
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{id}', [ServiceController::class, 'update']);
    Route::delete('/services/{id}', [ServiceController::class, 'destroy']);
    Route::get('/my-services', [ServiceController::class, 'myServices']);
    
    // Search
    Route::post('/workers/search', [ServiceController::class, 'search']);
    Route::get('/workers/filters', [ServiceController::class, 'filters']);
    
    // Requests
    Route::get('/client/requests', [RequestController::class, 'clientRequests']);
    Route::get('/worker/requests', [RequestController::class, 'workerRequests']);
    Route::post('/requests', [RequestController::class, 'store']);
    Route::put('/requests/{id}/status', [RequestController::class, 'updateStatus']);
    Route::put('/requests/{id}/assign-worker', [RequestController::class, 'assignWorker']);
    Route::delete('/requests/{id}', [RequestController::class, 'destroy']);
    
    // Admin only routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/users', [UserController::class, 'index']);
        Route::put('/admin/users/{id}', [UserController::class, 'update']);
        Route::delete('/admin/users/{id}', [UserController::class, 'destroy']);
    });
    
    // Orders
    Route::get('/worker/orders', [OrderController::class, 'workerOrders']);
    Route::put('/orders/{id}/accept', [OrderController::class, 'accept']);
    Route::put('/orders/{id}/start', [OrderController::class, 'startWork']);
    Route::put('/orders/{id}/complete', [OrderController::class, 'complete']);
    Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    
    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{id}', [FavoriteController::class, 'destroy']);
    Route::get('/favorites/check/{workerId}', [FavoriteController::class, 'check']);
    
    // Conversations
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{id}/messages', [ConversationController::class, 'messages']);
    
    // Messages
    Route::post('/messages', [MessageController::class, 'store']);
    Route::put('/messages/{id}/read', [MessageController::class, 'markAsRead']);
    Route::put('/conversations/{conversationId}/read-all', [MessageController::class, 'markAllAsRead']);
    
    // ==================== NOTIFICATIONS ROUTES ====================
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});