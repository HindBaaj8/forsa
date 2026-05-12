<?php

namespace App\Http\Controllers;

use App\Models\Notification;

class NotificationController extends Controller
{
    public function index()
    {
        return Notification::where('user_id', auth()->id())
            ->latest()
            ->paginate(20);
    }

    public function markAsRead(Notification $notification)
    {
        $notification->update(['read_at' => now()]);

        return ['message' => 'read'];
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', auth()->id())
            ->update(['read_at' => now()]);

        return ['message' => 'all read'];
    }
}