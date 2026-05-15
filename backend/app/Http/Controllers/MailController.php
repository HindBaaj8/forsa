<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\WelcomeMail;
use App\Mail\VerificationCodeMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;

class MailController extends Controller
{
    // إرسال بريد ترحيبي بعد التسجيل
    public function sendWelcomeEmail($email, $name)
    {
        Mail::to($email)->send(new WelcomeMail($name));
        return response()->json(['message' => 'Welcome email sent']);
    }
    
    // إرسال رمز التحقق
    public function sendVerificationCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ]);
        
        $code = rand(100000, 999999);
        Cache::put('verification_' . $request->email, $code, 600);
        
        $user = User::where('email', $request->email)->first();
        
        Mail::to($request->email)->send(new VerificationCodeMail($code, $user->first_name));
        
        return response()->json(['message' => 'Code sent successfully']);
    }
    
    // التحقق من الرمز
    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|digits:6'
        ]);
        
        $cachedCode = Cache::get('verification_' . $request->email);
        
        if ($cachedCode && $cachedCode == $request->code) {
            Cache::forget('verification_' . $request->email);
            return response()->json(['success' => true, 'message' => 'Code verified']);
        }
        
        return response()->json(['message' => 'Invalid code'], 422);
    }
}