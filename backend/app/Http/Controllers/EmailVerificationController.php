<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;


class EmailVerificationController extends Controller
{
    /**
     * تأكيد البريد الإلكتروني بالكود
     */
    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'code' => 'required|digits:6'
        ]);

        $cachedCode = Cache::get('email_verify_' . $request->email);

        if (!$cachedCode) {
            return response()->json([
                'message' => 'رمز التحقق منتهي الصلاحية'
            ], 422);
        }

        if ($cachedCode != $request->code) {
            return response()->json([
                'message' => 'رمز التحقق غير صحيح'
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        $user->update([
            'email_verified_at' => now()
        ]);

        Cache::forget('email_verify_' . $request->email);

        return response()->json([
            'success' => true,
            'message' => 'تم تأكيد البريد الإلكتروني بنجاح'
        ]);
    }

    /**
     * إعادة إرسال رمز التأكيد
     */
    public function resend(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'البريد الإلكتروني مؤكد بالفعل'
            ], 422);
        }

        $code = rand(100000, 999999);
        Cache::put('email_verify_' . $request->email, $code, 600);

        $this->sendVerificationEmail($request->email, $code, $user->first_name);

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال رمز التحقق'
        ]);
    }

    /**
     * إرسال البريد الإلكتروني
     */
    private function sendVerificationEmail($email, $code, $name)
    {
        $html = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>تأكيد البريد الإلكتروني - فرصة عمل</title>
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
                .header { background: linear-gradient(135deg, #1a2a3a 0%, #2c3e50 100%); color: white; padding: 30px; text-align: center; }
                .code { font-size: 48px; font-weight: bold; text-align: center; padding: 30px; background: #f0f0f0; margin: 20px; border-radius: 12px; letter-spacing: 10px; }
                .content { padding: 20px; text-align: center; }
                .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>📧 تأكيد البريد الإلكتروني</h2>
                    <p>منصة فرصة عمل</p>
                </div>
                <div class='content'>
                    <h3>مرحباً $name!</h3>
                    <p>رمز التأكيد الخاص بك هو:</p>
                    <div class='code'>$code</div>
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
            $message->to($email)->subject('📧 تأكيد البريد الإلكتروني - فرصة عمل');
        });
    }
}