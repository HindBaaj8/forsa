<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FavoriteController extends Controller
{
    // جلب قائمة المفضلين (عمال مفضلين عند العميل)
    public function index(Request $request)
    {
        $favorites = Favorite::with('worker')
            ->where('client_id', $request->user()->id)
            ->latest()
            ->paginate(20);
            
        return response()->json([
            'status' => 'success',
            'data' => $favorites
        ]);
    }
    
    // إضافة عامل إلى المفضلة
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'worker_id' => 'required|exists:users,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // تأكد أن المستخدم عميل
        if ($request->user()->role !== 'client') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only clients can add favorites'
            ], 403);
        }
        
        // تأكد أن العامل موجود وحاله active
        $worker = User::where('id', $request->worker_id)
            ->where('role', 'worker')
            ->first();
            
        if (!$worker) {
            return response()->json([
                'status' => 'error',
                'message' => 'Worker not found'
            ], 404);
        }
        
        // منع التكرار
        $existing = Favorite::where('client_id', $request->user()->id)
            ->where('worker_id', $request->worker_id)
            ->first();
            
        if ($existing) {
            return response()->json([
                'status' => 'error',
                'message' => 'Already in favorites'
            ], 422);
        }
        
        $favorite = Favorite::create([
            'client_id' => $request->user()->id,
            'worker_id' => $request->worker_id,
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Worker added to favorites',
            'data' => $favorite
        ], 201);
    }
    
    // حذف عامل من المفضلة
    public function destroy(Request $request, $id)
    {
        $favorite = Favorite::findOrFail($id);
        
        if ($favorite->client_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }
        
        $favorite->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Worker removed from favorites'
        ]);
    }
    
    // التحقق إذا كان عامل مفضل
    public function check(Request $request, $workerId)
    {
        $isFavorite = Favorite::where('client_id', $request->user()->id)
            ->where('worker_id', $workerId)
            ->exists();
            
        return response()->json([
            'status' => 'success',
            'is_favorite' => $isFavorite
        ]);
    }
}