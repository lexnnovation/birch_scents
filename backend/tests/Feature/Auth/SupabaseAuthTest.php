<?php

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

/**
 * Exercises VerifySupabaseJwt + EnsureAdmin (CLAUDE.md §6) against a
 * hand-signed ES256 token verified through a faked JWKS response — no live
 * Supabase call needed. Routes are registered per-test since these exercise
 * the middleware in isolation; the real Phase 8 routes are covered by their
 * own Feature tests.
 *
 * Supabase's current default signs access tokens asymmetrically (ES256) and
 * publishes public keys via JWKS, rather than a shared HS256 secret — this
 * test keypair (shared via tests/Support/SupabaseJwt.php) mirrors that shape.
 */
beforeEach(function () {
    Cache::forget('supabase_jwks');
    fakeJwks();

    Route::middleware(['auth.supabase'])->get('/__test/protected', function () {
        return response()->json(['data' => request()->user()->only(['supabase_id', 'email', 'is_admin'])]);
    });

    Route::middleware(['auth.supabase', 'admin'])->get('/__test/admin-only', function () {
        return response()->json(['data' => 'ok']);
    });
});

it('rejects a request with no bearer token', function () {
    $this->getJson('/__test/protected')->assertStatus(401);
});

it('rejects a tampered token', function () {
    $token = signToken(baseClaims());
    $tampered = substr($token, 0, -2).'xx';

    $this->withToken($tampered)->getJson('/__test/protected')->assertStatus(401);
});

it('rejects an expired token', function () {
    $token = signToken(baseClaims(['iat' => time() - 7200, 'exp' => time() - 3600]));

    $this->withToken($token)->getJson('/__test/protected')->assertStatus(401);
});

it('rejects a token with an unknown key id', function () {
    $token = signToken(baseClaims(), kid: 'some-other-key');

    $this->withToken($token)->getJson('/__test/protected')->assertStatus(401);
});

it('rejects a token whose header algorithm does not match the key it claims', function () {
    // Signed HS256 with an arbitrary secret but claiming our real kid — the
    // key's own alg ("ES256") must win, not whatever the token header says.
    $header = rtrim(strtr(base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT', 'kid' => TEST_KID])), '+/', '-_'), '=');
    $payload = rtrim(strtr(base64_encode(json_encode(baseClaims())), '+/', '-_'), '=');
    $signature = rtrim(strtr(base64_encode(hash_hmac('sha256', "{$header}.{$payload}", 'attacker-controlled-secret', true)), '+/', '-_'), '=');

    $this->withToken("{$header}.{$payload}.{$signature}")->getJson('/__test/protected')->assertStatus(401);
});

it('rejects a token with the wrong audience', function () {
    $token = signToken(baseClaims(['aud' => 'not-authenticated']));

    $this->withToken($token)->getJson('/__test/protected')->assertStatus(401);
});

it('rejects a token missing required claims', function () {
    $claims = baseClaims();
    unset($claims['email']);
    $token = signToken($claims);

    $this->withToken($token)->getJson('/__test/protected')->assertStatus(401);
});

it('accepts a valid token and auto-provisions the local user on first sight', function () {
    $supabaseId = (string) Str::uuid();
    $token = signToken(baseClaims(['sub' => $supabaseId, 'email' => 'new-shopper@example.com']));

    expect(User::where('supabase_id', $supabaseId)->exists())->toBeFalse();

    $response = $this->withToken($token)->getJson('/__test/protected');

    $response->assertOk();
    $response->assertJsonPath('data.supabase_id', $supabaseId);

    $user = User::where('supabase_id', $supabaseId)->first();
    expect($user)->not->toBeNull();
    expect($user->email)->toBe('new-shopper@example.com');
    expect($user->is_admin)->toBeFalse();
});

it('does not escalate an existing admin to non-admin on repeat sign-in', function () {
    $supabaseId = (string) Str::uuid();
    User::factory()->admin()->create(['supabase_id' => $supabaseId, 'email' => 'boss@example.com']);

    $token = signToken(baseClaims(['sub' => $supabaseId, 'email' => 'boss@example.com']));

    $this->withToken($token)->getJson('/__test/protected')->assertOk();

    expect(User::where('supabase_id', $supabaseId)->first()->is_admin)->toBeTrue();
});

it('forbids a non-admin user on an admin-gated route', function () {
    $token = signToken(baseClaims());

    $this->withToken($token)->getJson('/__test/admin-only')->assertStatus(403);
});

it('allows an admin user on an admin-gated route', function () {
    $supabaseId = (string) Str::uuid();
    User::factory()->admin()->create(['supabase_id' => $supabaseId]);
    $token = signToken(baseClaims(['sub' => $supabaseId]));

    $this->withToken($token)->getJson('/__test/admin-only')->assertOk();
});
