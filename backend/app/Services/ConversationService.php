<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Order;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class ConversationService
{
    /**
     * إنشاء محادثة جديدة بين عميل ومهني
     */
    public function createConversation($clientId, $workerId, $orderId = null)
    {
        return Conversation::create([
            'client_id' => $clientId,
            'worker_id' => $workerId,
            'order_id' => $orderId,
            'last_message_at' => now(),
        ]);
    }
    
    /**
     * جلب أو إنشاء محادثة
     */
    public function getOrCreateConversation($clientId, $workerId, $orderId = null)
    {
        $conversation = Conversation::where('client_id', $clientId)
            ->where('worker_id', $workerId)
            ->first();
            
        if (!$conversation) {
            $conversation = $this->createConversation($clientId, $workerId, $orderId);
        }
        
        return $conversation;
    }
    
    /**
     * إضافة رسالة للمحادثة
     */
    public function addMessage($conversationId, $senderId, $message)
    {
        $message = Message::create([
            'conversation_id' => $conversationId,
            'sender_id' => $senderId,
            'message' => $message,
            'is_read' => false,
        ]);
        
        // تحديث وقت آخر رسالة
        Conversation::where('id', $conversationId)->update([
            'last_message_at' => now()
        ]);
        
        return $message;
    }
    
    /**
     * جلب رسائل المحادثة
     */
    public function getMessages($conversationId)
    {
        return Message::where('conversation_id', $conversationId)
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get();
    }
    
    /**
     * تحديث الرسائل كمقروءة
     */
    public function markMessagesAsRead($conversationId, $userId)
    {
        return Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);
    }
}