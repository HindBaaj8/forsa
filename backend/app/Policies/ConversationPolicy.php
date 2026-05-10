<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    // Can user view this conversation?
    public function view(User $user, Conversation $conversation): bool
    {
        return $conversation->client_id === $user->id ||
               $conversation->worker_id === $user->id ||
               $conversation->admin_id === $user->id;
    }
    
    // Can user send message in this conversation?
    public function sendMessage(User $user, Conversation $conversation): bool
    {
        return $this->view($user, $conversation);
    }
}