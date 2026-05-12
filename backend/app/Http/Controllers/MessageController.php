<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;

class MessageController extends Controller
{
    public function store(Conversation $conversation)
    {
        $this->authorizeConversation($conversation);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => auth()->id(),
            'message' => request('message'),
            'type' => 'text'
        ]);

        $conversation->update(['last_message_at' => now()]);

        return $message;
    }

    public function index(Conversation $conversation)
    {
        $this->authorizeConversation($conversation);

        return $conversation->messages()->latest()->paginate(50);
    }

    private function authorizeConversation($conversation)
    {
        if (!in_array(auth()->id(), [$conversation->client_id, $conversation->worker_id])) {
            abort(403);
        }
    }
}