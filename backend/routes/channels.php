<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Conversation;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
*/

Broadcast::channel('conversation.{id}', function ($user, $id) {
    $conversation = Conversation::find($id);

    if (!$conversation) {
        return false;
    }

    // ✅ المسؤول يقدر يدخل لأي محادثة
    if ($user->role === 'admin') {
        return true;
    }

    // ✅ العميل أو العامل يقدر يدخل فقط إذا كان مشارك في المحادثة
    return in_array($user->id, [
        $conversation->client_id,
        $conversation->worker_id,
    ]);
});

// قناة المستخدم للإشعارات
Broadcast::channel('App.Models.User.{userId}', function ($user, $userId) {
    // المسؤول يقدر يشوف إشعارات أي مستخدم
    if ($user->role === 'admin') {
        return true;
    }
    // المستخدم العادي يشوف فقط إشعاراته
    return $user->id === (int) $userId;
});