<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Order;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ConversationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Get all conversations for authenticated user
     */
    public function index()
    {
        try {
            $userId = auth()->id();
            
            if (!$userId) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            Log::info('Getting conversations for user: ' . $userId);

            // ✅ جلب المحادثات بطريقة بسيطة
            $conversations = Conversation::where('client_id', $userId)
                ->orWhere('worker_id', $userId)
                ->get();

            Log::info('Found ' . $conversations->count() . ' conversations');

            // ✅ تنسيق البيانات
            $formatted = [];
            foreach ($conversations as $conv) {
                $isClient = ($conv->client_id == $userId);
                $participantId = $isClient ? $conv->worker_id : $conv->client_id;
                
                $participant = User::find($participantId);
                
                if ($participant) {
                    $formatted[] = [
                        'id' => $conv->id,
                        'participant' => [
                            'id' => $participant->id,
                            'name' => $participant->first_name . ' ' . $participant->last_name,
                            'avatar' => $participant->avatar,
                            'role' => $participant->role,
                        ],
                        'last_message_at' => $conv->last_message_at,
                        'created_at' => $conv->created_at,
                        'unread_count' => 0,
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'data' => $formatted
            ]);
            
        } catch (\Exception $e) {
            Log::error('Conversations index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Create a new conversation
     */
    public function store(Request $request)
    {
        try {
            $currentUser = auth()->user();
            $userId = $currentUser->id;
            
            Log::info('Store conversation - User: ' . $userId . ', Role: ' . $currentUser->role);
            Log::info('Request data: ', $request->all());

            // ✅ Worker يبعت user_id (ID ديال client)
            if ($currentUser->role === 'worker') {
                $request->validate([
                    'user_id' => 'required|exists:users,id'
                ]);
                
                $clientId = $request->user_id;
                $workerId = $userId;
                
                // تأكد أن المستخدم الآخر هو client
                $client = User::find($clientId);
                if (!$client || $client->role !== 'client') {
                    return response()->json(['message' => 'Invalid client ID'], 422);
                }
                
                // البحث عن محادثة موجودة أو إنشاء جديدة
                $conversation = Conversation::where('client_id', $clientId)
                    ->where('worker_id', $workerId)
                    ->first();
                
                if (!$conversation) {
                    $conversation = Conversation::create([
                        'client_id' => $clientId,
                        'worker_id' => $workerId,
                        'order_id' => null,
                    ]);
                }
                
                return response()->json([
                    'success' => true,
                    'data' => $conversation
                ], 201);
            }
            
            // ✅ Client يبعت worker_id (ID ديال worker)
            if ($currentUser->role === 'client') {
                $request->validate([
                    'worker_id' => 'required|exists:users,id'
                ]);
                
                $workerId = $request->worker_id;
                $clientId = $userId;
                
                // تأكد أن المستخدم الآخر هو worker
                $worker = User::find($workerId);
                if (!$worker || $worker->role !== 'worker') {
                    return response()->json(['message' => 'Invalid worker ID'], 422);
                }
                
                // البحث عن محادثة موجودة أو إنشاء جديدة
                $conversation = Conversation::where('client_id', $clientId)
                    ->where('worker_id', $workerId)
                    ->first();
                
                if (!$conversation) {
                    $conversation = Conversation::create([
                        'client_id' => $clientId,
                        'worker_id' => $workerId,
                        'order_id' => null,
                    ]);
                }
                
                return response()->json([
                    'success' => true,
                    'data' => $conversation
                ], 201);
            }
            
            return response()->json(['message' => 'Unauthorized'], 403);
            
        } catch (\Exception $e) {
            Log::error('Store conversation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single conversation
     */
    public function show(Conversation $conversation)
    {
        try {
            $userId = auth()->id();
            
            if (!in_array($userId, [$conversation->client_id, $conversation->worker_id])) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $conversation->load(['client', 'worker'])
            ]);
        } catch (\Exception $e) {
            Log::error('Show conversation error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }
}