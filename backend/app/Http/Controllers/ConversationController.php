<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Order;
use App\Services\ConversationService;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    protected $conversationService;

    public function __construct(ConversationService $conversationService)
    {
        $this->conversationService = $conversationService;
    }

    public function index()
    {
        $user = auth()->user();
        $conversations = Conversation::where('client_id', $user->id)
            ->orWhere('worker_id', $user->id)
            ->with(['client', 'worker', 'order'])
            ->latest('last_message_at')
            ->get();

        return response()->json($conversations);
    }

    public function show(Conversation $conversation)
    {
        if (!in_array(auth()->id(), [$conversation->client_id, $conversation->worker_id])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($conversation->load('client', 'worker', 'messages'));
    }

    public function getByOrder(Order $order)
    {
        if (!in_array(auth()->id(), [$order->client_id, $order->worker_id])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $conversation = $this->conversationService->getOrCreateConversation($order);
        return response()->json($conversation->load('client', 'worker'));
    }
}