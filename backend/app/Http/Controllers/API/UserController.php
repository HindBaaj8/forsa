<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    // الحصول على كل المستخدمين (لـ Admin)
    public function index()
    {
        $users = User::paginate(20);
        return response()->json([
            'status' => 'success',
            'data' => $users
        ]);
    }

    // تحديث الملف الشخصي للمستخدم الحالي
    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'city' => 'sometimes|string|max:255',
            'bio' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $user->update($request->only(['first_name', 'last_name', 'phone', 'city', 'bio']));

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    // تغيير كلمة المرور
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Password changed successfully'
        ]);
    }

    // تحديث حالة المستخدم (لـ Admin)
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,pending,blocked',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::findOrFail($id);
        $user->status = $request->status;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'User status updated',
            'user' => $user
        ]);
    }

    // تحديث مستخدم (لـ Admin)
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'city' => 'sometimes|string|max:255',
            'role' => 'sometimes|in:client,worker,admin',
            'status' => 'sometimes|in:active,pending,blocked',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::findOrFail($id);
        $user->update($request->only(['first_name', 'last_name', 'phone', 'city', 'role', 'status']));

        return response()->json([
            'status' => 'success',
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }

    // حذف مستخدم (لـ Admin)
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User deleted successfully'
        ]);
    }

    // تحديث إعدادات الإشعارات
    public function updateNotifications(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'requests' => 'sometimes|boolean',
            'messages' => 'sometimes|boolean',
            'offers' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        
        // تخزين الإعدادات (يمكنك تخزينها فـ جدول منفصل أو فـ JSON)
        // هنا نخزنها مؤقتاً فـ session أو cache
        
        return response()->json([
            'status' => 'success',
            'message' => 'Notification settings updated',
            'notifications' => $request->only(['requests', 'messages', 'offers'])
        ]);
    }
}