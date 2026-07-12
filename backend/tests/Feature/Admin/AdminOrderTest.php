<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Str;

it('forbids non-admins from admin order routes', function () {
    $user = User::factory()->create(['supabase_id' => (string) Str::uuid()]);
    $token = tokenFor($user->supabase_id);
    $order = Order::factory()->create();

    $this->withToken($token)->getJson('/api/v1/admin/orders')->assertStatus(403);
    $this->withToken($token)->patchJson("/api/v1/admin/orders/{$order->order_number}", ['status' => 'paid'])
        ->assertStatus(403);
});

it('lists orders across all customers, filterable by status', function () {
    [, $token] = adminUserAndToken();
    Order::factory()->create(['status' => OrderStatus::Pending]);
    Order::factory()->create(['status' => OrderStatus::Paid]);
    Order::factory()->create(['status' => OrderStatus::Paid]);

    $response = $this->withToken($token)->getJson('/api/v1/admin/orders?status=paid')->assertOk();

    expect($response->json('meta.total'))->toBe(2);
});

it('allows a valid status transition', function () {
    [, $token] = adminUserAndToken();
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);

    $response = $this->withToken($token)
        ->patchJson("/api/v1/admin/orders/{$order->order_number}", ['status' => 'paid'])
        ->assertOk();

    $response->assertJsonPath('data.status', 'paid');
    expect($order->fresh()->status)->toBe(OrderStatus::Paid);
});

it('rejects an invalid status transition', function () {
    [, $token] = adminUserAndToken();
    $order = Order::factory()->create(['status' => OrderStatus::Delivered]);

    $this->withToken($token)
        ->patchJson("/api/v1/admin/orders/{$order->order_number}", ['status' => 'pending'])
        ->assertStatus(422);

    expect($order->fresh()->status)->toBe(OrderStatus::Delivered);
});

it('rejects an unknown status value', function () {
    [, $token] = adminUserAndToken();
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);

    $this->withToken($token)
        ->patchJson("/api/v1/admin/orders/{$order->order_number}", ['status' => 'not-a-real-status'])
        ->assertStatus(422);
});
