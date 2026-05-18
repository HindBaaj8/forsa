<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!in_array($request->user()->role, $roles)) {
            return response()->json([
                'message' => 'Forbidden - You do not have permission to access this resource',
                'user_role' => $request->user()->role,
                'allowed_roles' => $roles
            ], 403);
        }

        return $next($request);
    }
}