<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Conversation $conversation)
    {
        if (!in_array(auth()->id(), [$conversation->client_id, $conversation->worker_id])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messages = $conversation->messages()
            ->with('sender')
            ->latest()
            ->paginate(50);

        return response()->json($messages);
    }

    public function store(Request $request, Conversation $conversation)
    {
        if (!in_array(auth()->id(), [$conversation->client_id, $conversation->worker_id])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string',
            'type' => 'sometimes|in:text,image',
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => auth()->id(),
            'message' => $validated['message'],
            'type' => $validated['type'] ?? 'text',
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json($message, 201);
    }

    public function markAsRead(Message $message)
    {
        $conversation = $message->conversation;

        if (!in_array(auth()->id(), [$conversation->client_id, $conversation->worker_id])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($message->sender_id !== auth()->id()) {
            $message->markAsRead();
        }

        return response()->json(['message' => 'Message marked as read']);
    }

    public function markAllAsRead(Conversation $conversation)
    {
        if (!in_array(auth()->id(), [$conversation->client_id, $conversation->worker_id])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $conversation->messages()
            ->where('sender_id', '!=', auth()->id())
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'All messages marked as read']);
    }
}