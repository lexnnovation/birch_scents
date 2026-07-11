<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;
use UnexpectedValueException;

/**
 * Verifies the Supabase-issued access JWT on every request (CLAUDE.md §6).
 * Laravel has no sessions/Sanctum — this is the single source of auth truth.
 *
 * Supabase's current default signs tokens asymmetrically (ES256) and
 * publishes the public keys at a JWKS endpoint, rather than a shared HS256
 * secret. Each `Firebase\JWT\Key` parsed from the JWKS carries its own `alg`
 * ("ES256"), which `JWT::decode()` cross-checks against the token header —
 * a token claiming any other alg (or an unknown `kid`) fails before its
 * signature is ever checked. `exp` is checked by the library; `aud`/`sub`
 * are not, so they're validated explicitly below. Never decode without
 * verifying.
 */
class VerifySupabaseJwt
{
    private const JWKS_CACHE_KEY = 'supabase_jwks';

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (! $token) {
            return $this->unauthorized('Missing bearer token.');
        }

        try {
            $payload = JWT::decode($token, $this->jwks());
        } catch (UnexpectedValueException) {
            // Possibly a rotated signing key we haven't cached yet — refetch once and retry.
            try {
                $payload = JWT::decode($token, $this->jwks(fresh: true));
            } catch (\Throwable) {
                return $this->unauthorized('Invalid or expired token.');
            }
        } catch (\Throwable) {
            return $this->unauthorized('Invalid or expired token.');
        }

        if (($payload->aud ?? null) !== 'authenticated') {
            return $this->unauthorized('Invalid token audience.');
        }

        $supabaseId = $payload->sub ?? null;
        $email = $payload->email ?? null;

        if (! $supabaseId || ! $email) {
            return $this->unauthorized('Token missing required claims.');
        }

        $user = User::firstOrNew(['supabase_id' => $supabaseId]);
        $user->email = $email;
        $user->name = $payload->user_metadata->name ?? $payload->user_metadata->full_name ?? $user->name;
        if (! $user->exists) {
            $user->is_admin = false;
        }
        $user->save();

        $request->setUserResolver(fn () => $user);

        return $next($request);
    }

    /**
     * @return array<string, \Firebase\JWT\Key>
     */
    private function jwks(bool $fresh = false): array
    {
        if ($fresh) {
            Cache::forget(self::JWKS_CACHE_KEY);
        }

        $jwksUri = rtrim(config('services.supabase.url'), '/').'/auth/v1/.well-known/jwks.json';

        $raw = Cache::remember(
            self::JWKS_CACHE_KEY,
            now()->addHour(),
            fn () => Http::timeout(5)->get($jwksUri)->throw()->json(),
        );

        return JWK::parseKeySet($raw);
    }

    private function unauthorized(string $message): Response
    {
        return response()->json(['message' => $message], 401);
    }
}
