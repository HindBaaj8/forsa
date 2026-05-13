<?php

use App\Http\Controllers\WorkerController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:worker'])->prefix('worker')->group(function () {
    Route::get('/dashboard', [WorkerController::class, 'dashboard']);
    Route::get('/services', [WorkerController::class, 'services']);
    Route::get('/orders', [WorkerController::class, 'orders']);
    Route::get('/earnings', [WorkerController::class, 'earnings']);
    Route::get('/schedule', [WorkerController::class, 'schedule']);
    Route::put('/schedule/{id}', [WorkerController::class, 'updateSchedule']);
    Route::get('/profile', [WorkerController::class, 'profile']);
    Route::put('/profile', [WorkerController::class, 'updateProfile']);
    Route::put('/notifications', [WorkerController::class, 'updateNotifications']);
});