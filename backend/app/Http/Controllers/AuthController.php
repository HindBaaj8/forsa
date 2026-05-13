<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:client,worker',
            'phone' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
            'city' => $validated['city'] ?? null,
            'status' => 'active',
            'rating' => 0,
            'total_reviews' => 0,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($validated)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        // تحديث آخر ظهور
        $user->update([
            'last_seen_at' => now(),
            'is_online' => true,
        ]);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        
        // تحديث حالة الاتصال
        $user->update([
            'is_online' => false,
            'last_seen_at' => now(),
        ]);
        
        $request->user()->currentAccessToken()->delete();
        
        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * 🔥 الحصول على معلومات المستخدم الحالي (كاملة)
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        // تحميل العلاقات الإضافية إذا احتجتها
        // $user->load(['services' => function($q) {
        //     $q->where('status', 'active')->limit(5);
        // }]);
        
        return response()->json([
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'phone' => $user->phone,
            'city' => $user->city,
            'role' => $user->role,
            'avatar' => $user->avatar,
            'bio' => $user->bio,
            'rating' => $user->rating,
            'total_reviews' => $user->total_reviews,
            'status' => $user->status,
            'is_online' => $user->is_online,
            'last_seen_at' => $user->last_seen_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ]);
    }

    /**
     * 🔥 تحديث الملف الشخصي (مطابق مع Model)
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();
            
            // التحقق من البيانات - متوافق مع fillable في Model
            $validated = $request->validate([
                'first_name' => 'sometimes|string|max:255',
                'last_name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20|nullable',
                'city' => 'sometimes|string|max:255|nullable',
                'bio' => 'sometimes|string|max:1000|nullable',
                'avatar' => 'sometimes|string|max:255|nullable',
                'email' => [
                    'sometimes',
                    'email',
                    'max:255',
                    Rule::unique('users')->ignore($user->id),
                ],
            ]);
            
            // تحديث المستخدم
            $user->update($validated);
            
            // إرجاع البيانات المحدثة
            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'city' => $user->city,
                    'bio' => $user->bio,
                    'avatar' => $user->avatar,
                    'role' => $user->role,
                    'rating' => $user->rating,
                    'status' => $user->status,
                ],
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
            
        } catch (\Exception $e) {
            \Log::error('Update profile error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 🔥 تغيير كلمة المرور
     */
    public function changePassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);
            
            $user = $request->user();
            
            // التحقق من كلمة المرور الحالية
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect',
                ], 422);
            }
            
            // تحديث كلمة المرور
            $user->update([
                'password' => Hash::make($validated['new_password']),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully',
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], 422);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage(),
            ], 500);
        }
    }
}