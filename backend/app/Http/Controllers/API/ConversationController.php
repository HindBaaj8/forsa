<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConversationController extends Controller
{
    // ✅ جلب كل المحادثات للمستخدم الحالي
    public function index(Request $request)
    {
        $user = $request->user();
        
        $conversations = Conversation::with(['client', 'worker', 'admin'])
            ->when($user->role === 'client', function($q) use ($user) {
                return $q->where('client_id', $user->id);
            })
            ->when($user->role === 'worker', function($q) use ($user) {
                return $q->where('worker_id', $user->id);
            })
            ->when($user->role === 'admin', function($q) use ($user) {
                return $q->where('admin_id', $user->id);
            })
            ->latest('last_message_at')
            ->paginate(20);
            
        return response()->json([
            'status' => 'success',
            'data' => $conversations
        ]);
    }
    
    // ✅ بدء محادثة جديدة
    public function store(Request $request)
    {
        $user = $request->user();
        
        if ($user->role === 'client') {
            $validator = Validator::make($request->all(), [
                'worker_id' => 'required|exists:users,id',
            ]);
            
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            
            $conversation = Conversation::firstOrCreate([
                'client_id' => $user->id,
                'worker_id' => $request->worker_id,
            ], [
                'type' => 'client_worker',
            ]);
            
        } elseif ($user->role === 'worker') {
            $validator = Validator::make($request->all(), [
                'client_id' => 'required|exists:users,id',
            ]);
            
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            
            $conversation = Conversation::firstOrCreate([
                'client_id' => $request->client_id,
                'worker_id' => $user->id,
            ], [
                'type' => 'client_worker',
            ]);
            
        } else {
            // Admin
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
            ]);
            
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            
            $targetUser = User::find($request->user_id);
            
            if ($targetUser->role === 'client') {
                $conversation = Conversation::create([
                    'client_id' => $targetUser->id,
                    'admin_id' => $user->id,
                    'type' => 'support',
                ]);
            } else {
                $conversation = Conversation::create([
                    'worker_id' => $targetUser->id,
                    'admin_id' => $user->id,
                    'type' => 'support',
                ]);
            }
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $conversation->load(['client', 'worker', 'admin'])
        ], 201);
    }
    
    // ✅ جلب رسائل محادثة معينة
    public function messages(Request $request, $id)
    {
        $conversation = Conversation::findOrFail($id);
        
        // ✅ Authorization using Policy
        $this->authorize('view', $conversation);
        
        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->paginate(50);
            
        // Mark messages as read
        $messages->where('sender_id', '!=', $request->user()->id)
            ->each(function ($message) {
                if (!$message->is_read) {
                    $message->update([
                        'is_read' => true,
                        'read_at' => now(),
                    ]);
                }
            });
            
        return response()->json([
            'status' => 'success',
            'data' => $messages
        ]);
    }
}