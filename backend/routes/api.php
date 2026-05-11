<?php

use Illuminate\Support\Facades\Route;

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

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);

Route::get('/test', fn () => response()->json(['message' => 'API is working']));

/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |-------------------------
    | AUTH
    |-------------------------
    */
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    /*
    |-------------------------
    | SHARED (ALL ROLES)
    |-------------------------
    */
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/user/change-password', [UserController::class, 'changePassword']);

    /*
    |--------------------------------------------------------------------------
    | CLIENT ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('client')->group(function () {

        Route::get('/dashboard', [DashboardController::class, 'clientDashboard']);
        Route::get('/requests', [RequestController::class, 'clientRequests']);

        Route::get('/favorites', [FavoriteController::class, 'index']);
        Route::post('/favorites', [FavoriteController::class, 'store']);
        Route::delete('/favorites/{id}', [FavoriteController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | WORKER ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('worker')->group(function () {

        Route::get('/dashboard', [DashboardController::class, 'workerDashboard']);

        Route::get('/orders', [OrderController::class, 'workerOrders']);

        Route::get('/schedule', [OrderController::class, 'schedule']);

        Route::get('/earnings', [DashboardController::class, 'workerEarnings']);

        Route::get('/services', [ServiceController::class, 'myServices']);

        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::put('/notifications', [NotificationController::class, 'updateSettings']);
    });

    /*
    |--------------------------------------------------------------------------
    | ADMIN ROUTES
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->middleware('admin')->group(function () {

        Route::get('/dashboard', [DashboardController::class, 'adminDashboard']);

        Route::get('/users', [UserController::class, 'index']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        Route::put('/users/{id}/status', [UserController::class, 'updateStatus']);

        Route::get('/workers', [UserController::class, 'getWorkers']);
        Route::put('/workers/{id}/status', [UserController::class, 'updateWorkerStatus']);

        Route::get('/finance', [DashboardController::class, 'adminFinance']);
    });

    /*
    |--------------------------------------------------------------------------
    | SERVICES (GLOBAL LOGIC)
    |--------------------------------------------------------------------------
    */
    Route::get('/services', [ServiceController::class, 'index']);
    Route::get('/services/{id}', [ServiceController::class, 'show']);
    Route::post('/services', [ServiceController::class, 'store']);
    Route::put('/services/{id}', [ServiceController::class, 'update']);
    Route::delete('/services/{id}', [ServiceController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | REQUESTS (GLOBAL)
    |--------------------------------------------------------------------------
    */
    Route::post('/requests', [RequestController::class, 'store']);
    Route::put('/requests/{id}/status', [RequestController::class, 'updateStatus']);
    Route::put('/requests/{id}/assign-worker', [RequestController::class, 'assignWorker']);
    Route::delete('/requests/{id}', [RequestController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | ORDERS (WORKFLOW)
    |--------------------------------------------------------------------------
    */
    Route::put('/orders/{id}/accept', [OrderController::class, 'accept']);
    Route::put('/orders/{id}/start', [OrderController::class, 'startWork']);
    Route::put('/orders/{id}/complete', [OrderController::class, 'complete']);
    Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);

    /*
    |--------------------------------------------------------------------------
    | MESSAGING
    |--------------------------------------------------------------------------
    */
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{id}/messages', [ConversationController::class, 'messages']);

    Route::post('/messages', [MessageController::class, 'store']);
    Route::put('/messages/{id}/read', [MessageController::class, 'markAsRead']);
    Route::put('/conversations/{id}/read-all', [MessageController::class, 'markAllAsRead']);

    /*
    |--------------------------------------------------------------------------
    | NOTIFICATIONS
    |--------------------------------------------------------------------------
    */
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});