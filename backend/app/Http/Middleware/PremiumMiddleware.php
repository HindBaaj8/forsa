<?php
namespace App\Http\Middleware;
use Closure;

class PremiumMiddleware
{
    public function handle($request, Closure $next)
    {
        $user = $request->user();
        
        if (!$user || !$user->isPremium()) {
            return response()->json([
                'success' => false,
                'message' => 'هذه الميزة متاحة فقط للأعضاء البريميوم'
            ], 403);
        }
        
        return $next($request);
    }
}