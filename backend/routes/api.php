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

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

/*
|--------------------------------------------------------------------------
| CATEGORIES (PUBLIC + ADMIN)
|--------------------------------------------------------------------------
*/
Route::prefix('categories')->group(function () {

    Route::get('/', [CategoryController::class, 'index']);

    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::post('/', [CategoryController::class, 'store']);
        Route::put('/{category}', [CategoryController::class, 'update']);
        Route::delete('/{category}', [CategoryController::class, 'destroy']);
    });
});

/*
|--------------------------------------------------------------------------
| SERVICES
|--------------------------------------------------------------------------
*/
Route::prefix('services')->group(function () {

    Route::get('/', [ServiceController::class, 'index']);
    Route::get('/{service}', [ServiceController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/', [ServiceController::class, 'store']);
        Route::put('/{service}', [ServiceController::class, 'update']);
        Route::delete('/{service}', [ServiceController::class, 'destroy']);

        Route::middleware('admin')->group(function () {
            Route::post('/{service}/approve', [ServiceController::class, 'approve']);
            Route::post('/{service}/reject', [ServiceController::class, 'reject']);
        });
    });
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

    // ✅ تحسين: استخدام POST بدل PUT لـ accept/reject (more RESTful)
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

    Route::post('/{order}/start', [OrderController::class, 'startWork']);
    Route::post('/{order}/complete', [OrderController::class, 'completeWork']);
    Route::post('/{order}/cancel', [OrderController::class, 'cancel']);
});

/*
|--------------------------------------------------------------------------
| CONVERSATIONS
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->prefix('conversations')->group(function () {

    Route::get('/', [ConversationController::class, 'index']);
    Route::get('/{conversation}', [ConversationController::class, 'show']);
    
    // ✅ تحسين: أكثر وضوحاً
    Route::get('/by-order/{order}', [ConversationController::class, 'getByOrder']);
});

/*
|--------------------------------------------------------------------------
| MESSAGES
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/conversations/{conversation}/messages', [MessageController::class, 'index']);
    Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store']);

    // ✅ تحسين: استخدام POST بدل PUT (better for actions)
    Route::post('/messages/{message}/read', [MessageController::class, 'markAsRead']);
    Route::post('/conversations/{conversation}/read-all', [MessageController::class, 'markAllAsRead']);
});

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