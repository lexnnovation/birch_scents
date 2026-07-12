<?php

use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Shared test helpers for hand-signing Supabase-shaped ES256 JWTs, verified
 * through a faked JWKS response (CLAUDE.md §6) — no live Supabase call
 * needed. Used by any Feature test that needs an authenticated/admin user.
 */
const TEST_KID = 'test-key-1';

// A throwaway P-256 keypair generated for this test suite only.
const TEST_EC_PRIVATE_KEY = <<<'PEM'
-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIKkMLuByzw7dJNTLhWSSM+3eT75fiAVWRJIn7d0nOaQ3oAoGCCqGSM49
AwEHoUQDQgAEyyrDdY1Ngh7eNGMHhXJvkNXz7tzu7v3gVFz3XWnXemda/Jz6ftP4
ihX4PsMFqJ6o3nl3G0Ca9YJHMOz35/vQdg==
-----END EC PRIVATE KEY-----
PEM;

const TEST_JWK_X = 'yyrDdY1Ngh7eNGMHhXJvkNXz7tzu7v3gVFz3XWnXemc';
const TEST_JWK_Y = 'Wvyc-n7T-IoV-D7DBaieqN55dxtAmvWCRzDs9-f70HY';

function fakeJwks(): void
{
    Http::fake([
        '*/.well-known/jwks.json' => Http::response([
            'keys' => [[
                'kty' => 'EC',
                'crv' => 'P-256',
                'alg' => 'ES256',
                'use' => 'sig',
                'kid' => TEST_KID,
                'x' => TEST_JWK_X,
                'y' => TEST_JWK_Y,
            ]],
        ]),
    ]);
}

function signToken(array $claims, ?string $kid = TEST_KID): string
{
    return JWT::encode($claims, TEST_EC_PRIVATE_KEY, 'ES256', $kid);
}

function baseClaims(array $overrides = []): array
{
    return array_merge([
        'sub' => (string) Str::uuid(),
        'email' => 'shopper@example.com',
        'aud' => 'authenticated',
        'iat' => time(),
        'exp' => time() + 3600,
    ], $overrides);
}

/** Signs a token for an existing (or newly auto-provisioned) user and fakes the JWKS. */
function tokenFor(?string $supabaseId = null, array $claimOverrides = []): string
{
    fakeJwks();

    return signToken(baseClaims(array_merge(
        $supabaseId ? ['sub' => $supabaseId] : [],
        $claimOverrides,
    )));
}

/** Creates an admin user and returns [$user, $token] for authenticated admin requests. */
function adminUserAndToken(): array
{
    $admin = User::factory()->admin()->create(['supabase_id' => (string) Str::uuid()]);

    return [$admin, tokenFor($admin->supabase_id)];
}
