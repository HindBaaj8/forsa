<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Order;
use App\Services\ConversationService;

class ConversationController extends Controller
{
    public function __construct(
        private ConversationService $conversationService
    ) {
        $this->middleware('auth:sanctum');
    }

    public function index()
    {
        $user = auth()->user();

        return Conversation::where('client_id',$user->id)
            ->orWhere('worker_id',$user->id)
            ->with('order')
            ->latest()
            ->get();
    }

    public function getByOrder(Order $order)
    {
        return $this->conversationService->getOrCreateConversation($order);
    }

    public function show(Conversation $conversation)
    {
        return $conversation->load('messages','client','worker');
    }
}