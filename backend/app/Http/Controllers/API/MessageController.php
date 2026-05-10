<?php

namespace App\Http\Controllers\API;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    // إرسال رسالة
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'conversation_id' => 'required|exists:conversations,id',
            'message' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $conversation = Conversation::findOrFail($request->conversation_id);
        
        // ✅ Authorization using Policy
        $this->authorize('sendMessage', $conversation);
        
        // Create message
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $request->user()->id,
            'message' => $request->message,
        ]);
        
        // Update conversation last message
        $conversation->update([
            'last_message' => $request->message,
            'last_message_at' => now(),
        ]);
        
        // ✅ Broadcast to others only
        broadcast(new MessageSent($message, $conversation))->toOthers();
        
        return response()->json([
            'status' => 'success',
            'data' => $message->load('sender')
        ], 201);
    }
    
    // ✅ تحديد رسالة كمقروءة
    public function markAsRead(Request $request, $id)
    {
        $message = Message::findOrFail($id);
        $conversation = $message->conversation;
        
        $this->authorize('view', $conversation);
        
        if ($message->sender_id !== $request->user()->id && !$message->is_read) {
            $message->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }
        
        return response()->json(['message' => 'Message marked as read']);
    }
    
    // ✅ تحديد كل رسائل محادثة كمقروءة
    public function markAllAsRead(Request $request, $conversationId)
    {
        $conversation = Conversation::findOrFail($conversationId);
        
        $this->authorize('view', $conversation);
        
        $conversation->messages()
            ->where('sender_id', '!=', $request->user()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
            
        return response()->json(['message' => 'All messages marked as read']);
    }
}