<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if (!in_array(auth()->user()->role, $roles)) {
            return response()->json(['message' => 'Forbidden - You do not have permission to access this resource'], 403);
        }

        return $next($request);
    }
}