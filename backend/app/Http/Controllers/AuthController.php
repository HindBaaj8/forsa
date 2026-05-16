<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * تسجيل مستخدم جديد
     */
    /**
 * تسجيل مستخدم جديد مع إرسال رمز تأكيد البريد الإلكتروني
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

        // ✅ إنشاء token مؤقت (للتسجيل فقط، مش للدخول)
        $token = $user->createToken('auth_token')->plainTextToken;

        // ✅ إرسال رمز تأكيد البريد الإلكتروني
        $code = rand(100000, 999999);
        Cache::put('email_verify_' . $user->email, $code, 3600);
        
        $this->sendVerificationEmail($user->email, $code, $user->first_name);

        return response()->json([
            'success' => true,
            'message' => 'تم التسجيل بنجاح. يرجى تأكيد بريدك الإلكتروني',
            'email' => $user->email,
            'token' => $token,  // ✅ نعطي token مؤقت
            'user' => $user
        ], 201);
        
    } catch (ValidationException $e) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        \Log::error('Register error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Server error: ' . $e->getMessage()
        ], 500);
    }
}

private function sendVerificationEmail($email, $code, $name)
{
    try {
        $html = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>تأكيد البريد الإلكتروني</title>
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; }
                .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; }
                .header { background: #2c3e50; color: white; padding: 30px; text-align: center; }
                .code { font-size: 48px; text-align: center; padding: 30px; background: #f0f0f0; margin: 20px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>تأكيد البريد الإلكتروني</h2>
                </div>
                <div class='content'>
                    <h3>مرحباً $name!</h3>
                    <p>رمز التأكيد الخاص بك هو:</p>
                    <div class='code'>$code</div>
                    <p>هذا الرمز صالح لمدة 10 دقائق.</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        Mail::html($html, function ($message) use ($email) {
            $message->to($email)->subject('تأكيد البريد الإلكتروني - فرصة عمل');
        });
    } catch (\Exception $e) {
        \Log::error('Failed to send email: ' . $e->getMessage());
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
     * تغيير كلمة المرور (من الإعدادات)
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

    // ===================== OTP RESET PASSWORD (3 PAGES SEPARATED) =====================

    /**
     * 1️⃣ إرسال OTP لإعادة تعيين كلمة المرور (صفحة 1: إدخال الإيميل)
     */
    public function sendOtpReset(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $email = $request->email;
        $key = 'otp_request_' . $email;

        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'message' => 'لقد تجاوزت الحد المسموح. يرجى المحاولة بعد ' . ceil($seconds / 60) . ' دقائق'
            ], 429);
        }

        RateLimiter::hit($key, 900);

        $lastOtpKey = 'otp_last_sent_' . $email;
        if (Cache::has($lastOtpKey)) {
            return response()->json([
                'message' => 'يرجى الانتظار 60 ثانية قبل طلب رمز جديد'
            ], 429);
        }

        $user = User::where('email', $email)->first();
        $otp = rand(100000, 999999);

        \Log::info('Generated OTP for ' . $email . ': ' . $otp);

        Cache::put('otp_reset_' . $email, [
            'code' => $otp,
            'attempts' => 0
        ], 60);
        
        Cache::put($lastOtpKey, true, 60);

        $this->sendOtpResetEmail($email, $otp, $user->first_name);

        return response()->json([
            'success' => true, 
            'message' => 'تم إرسال رمز التحقق'
        ]);
    }

    /**
     * 2️⃣ التحقق من OTP فقط (صفحة 2: إدخال الكود فقط)
     */
    public function verifyOtpOnly(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6'
        ]);

        $email = $request->email;
        $cachedData = Cache::get('otp_reset_' . $email);

        \Log::info('OTP Verification:', [
            'email' => $email,
            'otp_received' => $request->otp,
            'cached_otp' => $cachedData ? $cachedData['code'] : null,
            'attempts' => $cachedData ? $cachedData['attempts'] : null
        ]);

        if (!$cachedData) {
            return response()->json(['message' => 'رمز التحقق منتهي الصلاحية (60 ثانية). يرجى طلب رمز جديد'], 422);
        }

        $storedOtp = $cachedData['code'];
        $attempts = $cachedData['attempts'];

        if ($attempts >= 3) {
            Cache::forget('otp_reset_' . $email);
            return response()->json([
                'message' => 'لقد تجاوزت الحد المسموح من المحاولات. يرجى طلب رمز جديد'
            ], 429);
        }

        if ((string)$storedOtp !== (string)$request->otp) {
            Cache::put('otp_reset_' . $email, [
                'code' => $storedOtp,
                'attempts' => $attempts + 1
            ], 60);
            
            $remaining = 3 - ($attempts + 1);
            return response()->json([
                'message' => 'رمز التحقق غير صحيح. لديك ' . $remaining . ' محاولات متبقية'
            ], 422);
        }

        Cache::put('otp_verified_' . $email, true, 300);

        return response()->json([
            'success' => true,
            'message' => 'تم التحقق بنجاح',
            'email' => $email
        ]);
    }

    /**
     * 3️⃣ تغيير كلمة المرور بعد التحقق من OTP (صفحة 3: كلمة المرور فقط)
     */
    public function resetPasswordWithOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed'
        ]);

        $email = $request->email;
        $isVerified = Cache::get('otp_verified_' . $email);

        if (!$isVerified) {
            return response()->json([
                'message' => 'يرجى التحقق من الرمز أولاً'
            ], 422);
        }

        $user = User::where('email', $email)->first();
        
        if (!$user) {
            return response()->json(['message' => 'المستخدم غير موجود'], 422);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // تنظيف cache
        Cache::forget('otp_verified_' . $email);
        Cache::forget('otp_reset_' . $email);
        Cache::forget('otp_request_' . $email);
        Cache::forget('otp_last_sent_' . $email);

        return response()->json([
            'success' => true,
            'message' => 'تم تغيير كلمة المرور بنجاح'
        ]);
    }

    // ===================== EMAIL METHODS =====================

    private function sendOtpResetEmail($email, $otp, $name)
    {
        $html = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>إعادة تعيين كلمة المرور - فرصة عمل</title>
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
                    <h2>🔐 إعادة تعيين كلمة المرور</h2>
                    <p>منصة فرصة عمل</p>
                </div>
                <div class='content'>
                    <h3>مرحباً $name!</h3>
                    <p>رمز التحقق الخاص بك هو:</p>
                    <div class='otp-code'>$otp</div>
                    <p>هذا الرمز صالح لمدة <strong>60 ثانية فقط</strong>.</p>
                    <p>لديك <strong>3 محاولات فقط</strong>. بعد ذلك سيتم إلغاء الرمز.</p>
                </div>
                <div class='footer'>
                    <p>© " . date('Y') . " فرصة عمل - جميع الحقوق محفوظة</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        Mail::html($html, function ($message) use ($email) {
            $message->to($email)
                    ->subject('🔐 إعادة تعيين كلمة المرور - فرصة عمل');
        });
    }

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
        
        Mail::html($html, function ($message) use ($email) {
            $message->to($email)
                    ->subject('🔐 رمز التحقق - فرصة عمل');
        });
    }
}