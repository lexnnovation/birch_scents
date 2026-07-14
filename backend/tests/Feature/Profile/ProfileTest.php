<?php

use App\Models\User;
use Illuminate\Support\Str;

it('rejects unauthenticated requests to the profile', function () {
    $this->getJson('/api/v1/me')->assertStatus(401);
    $this->patchJson('/api/v1/me', ['name' => 'Someone'])->assertStatus(401);
});

it('returns the authenticated user\'s own profile', function () {
    $user = User::factory()->create([
        'supabase_id' => (string) Str::uuid(),
        'name' => 'Ama Owusu',
        'phone' => '+233241234567',
        'address' => '12 Independence Ave',
        'city' => 'Accra',
    ]);
    // VerifySupabaseJwt re-syncs email from the JWT claim on every request
    // (it's the source of truth for that field), so the token's own email
    // claim — not the factory's random one — is what the response reflects.
    $token = tokenFor($user->supabase_id, ['email' => $user->email]);

    $response = $this->withToken($token)->getJson('/api/v1/me')->assertOk();

    $response->assertJson(['data' => [
        'name' => 'Ama Owusu',
        'email' => $user->email,
        'phone' => '+233241234567',
        'address' => '12 Independence Ave',
        'city' => 'Accra',
    ]]);
});

it('updates and persists the profile', function () {
    $user = User::factory()->create(['supabase_id' => (string) Str::uuid()]);
    $token = tokenFor($user->supabase_id);

    $this->withToken($token)->patchJson('/api/v1/me', [
        'phone' => '+233201112222',
        'address' => '5 Ring Road',
        'city' => 'Tema',
    ])->assertOk()->assertJson(['data' => [
        'phone' => '+233201112222',
        'address' => '5 Ring Road',
        'city' => 'Tema',
    ]]);

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'phone' => '+233201112222',
        'address' => '5 Ring Road',
        'city' => 'Tema',
    ]);
});

it('ignores an attempt to change name — Supabase-managed, would be overwritten on the next request anyway', function () {
    $user = User::factory()->create(['supabase_id' => (string) Str::uuid(), 'name' => 'Original Name']);
    $token = tokenFor($user->supabase_id);

    $this->withToken($token)->patchJson('/api/v1/me', ['name' => 'Sneaky New Name'])->assertOk();

    expect($user->fresh()->name)->toBe('Original Name');
});

it('rejects an overlong field', function () {
    $user = User::factory()->create(['supabase_id' => (string) Str::uuid()]);
    $token = tokenFor($user->supabase_id);

    $this->withToken($token)->patchJson('/api/v1/me', [
        'address' => str_repeat('a', 501),
    ])->assertStatus(422)->assertJsonValidationErrors(['address']);
});

it('does not reset phone/address/city on a later request, even though VerifySupabaseJwt runs every time', function () {
    $user = User::factory()->create(['supabase_id' => (string) Str::uuid()]);
    $token = tokenFor($user->supabase_id);

    $this->withToken($token)->patchJson('/api/v1/me', [
        'phone' => '+233201112222',
        'address' => '5 Ring Road',
        'city' => 'Tema',
    ])->assertOk();

    // A second, unrelated authenticated request re-runs the JWT middleware
    // (which syncs email/name on every request) — it must not touch these.
    $this->withToken($token)->getJson('/api/v1/orders')->assertOk();

    $response = $this->withToken($token)->getJson('/api/v1/me')->assertOk();

    $response->assertJson(['data' => [
        'phone' => '+233201112222',
        'address' => '5 Ring Road',
        'city' => 'Tema',
    ]]);
});
