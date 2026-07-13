<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gates /bo/* routes (the admin API, deliberately not under an "admin"
 * path). Admin status is only ever the `is_admin` column (CLAUDE.md §6) —
 * never derived from JWT claims or frontend state. Must run after
 * VerifySupabaseJwt so $request->user() is bound.
 */
class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->is_admin) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return $next($request);
    }
}
