<?php

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Str;

it('rejects unauthenticated requests to list orders', function () {
    $this->getJson('/api/v1/orders')->assertStatus(401);
});

it('only lists the authenticated user\'s own orders', function () {
    $me = User::factory()->create(['supabase_id' => (string) Str::uuid()]);
    $someoneElse = User::factory()->create();

    Order::factory()->count(2)->create(['user_id' => $me->id]);
    Order::factory()->count(3)->create(['user_id' => $someoneElse->id]);

    $token = tokenFor($me->supabase_id);

    $response = $this->withToken($token)->getJson('/api/v1/orders')->assertOk();

    expect($response->json('meta.total'))->toBe(2);
});

it('404s when a user requests another user\'s order by number', function () {
    $me = User::factory()->create(['supabase_id' => (string) Str::uuid()]);
    $someoneElse = User::factory()->create();
    $theirOrder = Order::factory()->create(['user_id' => $someoneElse->id, 'order_number' => 'BS-2026-000001']);

    $token = tokenFor($me->supabase_id);

    $this->withToken($token)->getJson("/api/v1/orders/{$theirOrder->order_number}")->assertStatus(404);
});

it('returns the order when it belongs to the authenticated user', function () {
    $me = User::factory()->create(['supabase_id' => (string) Str::uuid()]);
    $order = Order::factory()->create(['user_id' => $me->id, 'order_number' => 'BS-2026-000002']);

    $token = tokenFor($me->supabase_id);

    $response = $this->withToken($token)->getJson("/api/v1/orders/{$order->order_number}")->assertOk();

    $response->assertJsonPath('data.orderNumber', 'BS-2026-000002');
});
