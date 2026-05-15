<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * تسجيل مستخدم جديد
     */
    public function register(Request $request)
    {
        try {
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
            
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تسجيل الدخول العادي
     */
    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            if (!Auth::attempt($validated)) {
                return response()->json([
                    'message' => 'The provided credentials are incorrect.'
                ], 422);
            }

            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            $user->update([
                'last_seen_at' => now(),
                'is_online' => true,
            ]);

            return response()->json([
                'user' => $user,
                'token' => $token,
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تسجيل الخروج
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        
        $user->update([
            'is_online' => false,
            'last_seen_at' => now(),
        ]);
        
        $request->user()->currentAccessToken()->delete();
        
        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * معلومات المستخدم الحالي
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
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
     * تحديث الملف الشخصي
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();
            
            $validated = $request->validate([
                'first_name' => 'sometimes|string|max:255',
                'last_name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20|nullable',
                'city' => 'sometimes|string|max:255|nullable',
                'bio' => 'sometimes|string|max:1000|nullable',
                'avatar' => 'sometimes|string|max:255|nullable',
            ]);
            
            $user->update($validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => $user
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

    /**
     * تغيير كلمة المرور
     */
    public function changePassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);
            
            $user = $request->user();
            
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect',
                ], 422);
            }
            
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

    /**
     * إرسال رابط إعادة تعيين كلمة المرور
     */
    public function forgotPassword(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email'
            ]);
            
            $token = Str::random(60);
            
            \DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $request->email],
                ['token' => $token, 'created_at' => now()]
            );
            
            $resetLink = "http://localhost:3000/reset-password?token={$token}&email=" . urlencode($request->email);
            
            return response()->json([
                'success' => true,
                'message' => 'Reset link sent successfully',
                'reset_link' => $resetLink
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إعادة تعيين كلمة المرور
     */
    public function resetPassword(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email',
                'token' => 'required|string',
                'password' => 'required|string|min:8|confirmed'
            ]);
            
            $resetRecord = \DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->where('token', $request->token)
                ->first();
            
            if (!$resetRecord) {
                return response()->json([
                    'message' => 'Invalid or expired token'
                ], 422);
            }
            
            if (now()->diffInMinutes($resetRecord->created_at) > 60) {
                return response()->json([
                    'message' => 'Token has expired'
                ], 422);
            }
            
            $user = User::where('email', $request->email)->first();
            $user->update([
                'password' => Hash::make($request->password)
            ]);
            
            \DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully'
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إرسال كود OTP إلى البريد الإلكتروني
     */
    public function sendOtp(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email'
            ]);
            
            $user = User::where('email', $request->email)->first();
            $otp = rand(100000, 999999);
            
            Cache::put('otp_' . $request->email, $otp, 600);
            
            $this->sendOtpEmail($request->email, $otp, $user->first_name);
            
            return response()->json([
                'success' => true,
                'message' => 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
                'email' => $request->email
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * التحقق من كود OTP
     */
    public function verifyOtp(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'otp' => 'required|digits:6'
            ]);
            
            $cachedOtp = Cache::get('otp_' . $request->email);
            
            if (!$cachedOtp) {
                return response()->json([
                    'message' => 'رمز التحقق منتهي الصلاحية'
                ], 422);
            }
            
            if ($cachedOtp != $request->otp) {
                return response()->json([
                    'message' => 'رمز التحقق غير صحيح'
                ], 422);
            }
            
            Cache::forget('otp_' . $request->email);
            Cache::put('verified_' . $request->email, true, 300);
            
            return response()->json([
                'success' => true,
                'message' => 'تم التحقق بنجاح',
                'email' => $request->email
            ]);
            
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تسجيل الدخول باستخدام OTP
     */
    public function loginWithOtp(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email'
            ]);
            
            $isVerified = Cache::get('verified_' . $request->email);
            
            if (!$isVerified) {
                return response()->json([
                    'message' => 'يرجى التحقق من بريدك الإلكتروني أولاً'
                ], 422);
            }
            
            $user = User::where('email', $request->email)->first();
            
            if (!$user) {
                return response()->json([
                    'message' => 'المستخدم غير موجود'
                ], 422);
            }
            
            Auth::login($user);
            $token = $user->createToken('auth_token')->plainTextToken;
            
            $user->update([
                'last_seen_at' => now(),
                'is_online' => true,
            ]);
            
            Cache::forget('verified_' . $request->email);
            
            return response()->json([
                'user' => $user,
                'token' => $token,
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إرسال البريد الإلكتروني مع OTP
     */
    private function sendOtpEmail($email, $otp, $name)
    {
        $html = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>رمز التحقق - فرصة عمل</title>
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
                .header { background: linear-gradient(135deg, #1a2a3a 0%, #2c3e50 100%); color: white; padding: 30px; text-align: center; }
                .otp-code { font-size: 48px; font-weight: bold; text-align: center; padding: 30px; background: #f0f0f0; margin: 20px; border-radius: 12px; letter-spacing: 10px; }
                .content { padding: 20px; text-align: center; }
                .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>🔐 رمز التحقق</h2>
                    <p>منصة فرصة عمل</p>
                </div>
                <div class='content'>
                    <h3>مرحباً $name!</h3>
                    <p>رمز التحقق الخاص بك هو:</p>
                    <div class='otp-code'>$otp</div>
                    <p>هذا الرمز صالح لمدة <strong>10 دقائق</strong>.</p>
                </div>
                <div class='footer'>
                    <p>© " . date('Y') . " فرصة عمل - جميع الحقوق محفوظة</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        Mail::send([], [], function ($message) use ($email, $html) {
            $message->to($email)
                    ->subject('🔐 رمز التحقق - فرصة عمل')
                    ->setBody($html, 'text/html');
        });
    }
}