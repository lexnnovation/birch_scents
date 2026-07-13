<?php

use App\Enums\PaymentStatus;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

function validDelivery(array $overrides = []): array
{
    return array_merge([
        'name' => 'Ama Owusu',
        'phone' => '+233241234567',
        'address' => '12 Independence Ave',
        'city' => 'Accra',
        'note' => null,
    ], $overrides);
}

it('rejects unauthenticated checkout', function () {
    $this->postJson('/api/v1/checkout', ['items' => [], 'delivery' => validDelivery()])->assertStatus(401);
});

it('rejects checkout with missing delivery fields', function () {
    $user = User::factory()->create(['supabase_id' => (string) Str::uuid()]);
    $token = tokenFor($user->supabase_id);

    $this->withToken($token)->postJson('/api/v1/checkout', [
        'items' => [],
        'delivery' => ['name' => 'Ama'],
    ])->assertStatus(422)
        ->assertJsonValidationErrors(['items', 'delivery.phone', 'delivery.address', 'delivery.city']);
});

it('computes totals from server-side prices, ignoring anything the client sends', function () {
    fakePaystackInitialize('https://checkout.paystack.com/real-looking-code');

    $user = User::factory()->create(['supabase_id' => (string) Str::uuid()]);
    $token = tokenFor($user->supabase_id);

    $product = Product::factory()->create(['name' => 'Snow Melon']);
    $variant = ProductVariant::factory()->create([
        'product_id' => $product->id,
        'label' => '100ml',
        'price_pesewas' => 24500,
        'stock' => 10,
    ]);

    $response = $this->withToken($token)->postJson('/api/v1/checkout', [
        'items' => [
            // A client attempting to smuggle in an out-of-band price — the
            // request schema doesn't even accept a price field, so this is
            // silently ignored rather than trusted.
            ['variantId' => (string) $variant->id, 'quantity' => 2, 'pricePesewas' => 1],
        ],
        'delivery' => validDelivery(),
    ])->assertCreated();

    $expectedSubtotal = 24500 * 2;
    $expectedTotal = $expectedSubtotal + config('checkout.delivery_fee_pesewas');

    $response->assertJsonStructure(['data' => ['authorizationUrl', 'accessCode', 'reference', 'orderNumber']]);
    $response->assertJsonPath('data.authorizationUrl', 'https://checkout.paystack.com/real-looking-code');
    $response->assertJsonPath('data.accessCode', 'fake-access-code');

    $this->assertDatabaseHas('orders', [
        'user_id' => $user->id,
        'order_number' => $response->json('data.orderNumber'),
        'status' => 'pending',
        'subtotal_pesewas' => $expectedSubtotal,
        'total_pesewas' => $expectedTotal,
    ]);
    $this->assertDatabaseHas('payments', [
        'reference' => $response->json('data.reference'),
        'status' => PaymentStatus::Pending->value,
        'amount_pesewas' => $expectedTotal,
    ]);
    $this->assertDatabaseHas('order_items', [
        'unit_price_pesewas' => 24500,
        'quantity' => 2,
    ]);

    // Stock is only decremented by the Paystack webhook (Phase 9), never at checkout.
    expect($variant->fresh()->stock)->toBe(10);
});

it('rolls back the whole checkout if Paystack initialization fails', function () {
    Http::fake(['api.paystack.co/transaction/initialize' => Http::response(['status' => false, 'message' => 'nope'], 400)]);

    $user = User::factory()->create(['supabase_id' => (string) Str::uuid()]);
    $token = tokenFor($user->supabase_id);
    $variant = ProductVariant::factory()->create(['stock' => 10]);

    $this->withToken($token)->postJson('/api/v1/checkout', [
        'items' => [['variantId' => (string) $variant->id, 'quantity' => 1]],
        'delivery' => validDelivery(),
    ])->assertStatus(502);

    $this->assertDatabaseCount('orders', 0);
    $this->assertDatabaseCount('payments', 0);
});

it('rejects checkout when requested quantity exceeds stock (409)', function () {
    $user = User::factory()->create(['supabase_id' => (string) Str::uuid()]);
    $token = tokenFor($user->supabase_id);

    $variant = ProductVariant::factory()->create(['stock' => 1]);

    $this->withToken($token)->postJson('/api/v1/checkout', [
        'items' => [['variantId' => (string) $variant->id, 'quantity' => 5]],
        'delivery' => validDelivery(),
    ])->assertStatus(409);

    $this->assertDatabaseCount('orders', 0);
});

it('rejects checkout for an inactive variant (409)', function () {
    $user = User::factory()->create(['supabase_id' => (string) Str::uuid()]);
    $token = tokenFor($user->supabase_id);

    $variant = ProductVariant::factory()->inactive()->create(['stock' => 10]);

    $this->withToken($token)->postJson('/api/v1/checkout', [
        'items' => [['variantId' => (string) $variant->id, 'quantity' => 1]],
        'delivery' => validDelivery(),
    ])->assertStatus(409);
});

it('rejects checkout for a variant whose product is inactive (409)', function () {
    $user = User::factory()->create(['supabase_id' => (string) Str::uuid()]);
    $token = tokenFor($user->supabase_id);

    $product = Product::factory()->inactive()->create();
    $variant = ProductVariant::factory()->create(['product_id' => $product->id, 'stock' => 10]);

    $this->withToken($token)->postJson('/api/v1/checkout', [
        'items' => [['variantId' => (string) $variant->id, 'quantity' => 1]],
        'delivery' => validDelivery(),
    ])->assertStatus(409);
});

it('sums multiple line items correctly in one transaction', function () {
    fakePaystackInitialize();

    $user = User::factory()->create(['supabase_id' => (string) Str::uuid()]);
    $token = tokenFor($user->supabase_id);

    $variantA = ProductVariant::factory()->create(['price_pesewas' => 10000, 'stock' => 10]);
    $variantB = ProductVariant::factory()->create(['price_pesewas' => 5000, 'stock' => 10]);

    $response = $this->withToken($token)->postJson('/api/v1/checkout', [
        'items' => [
            ['variantId' => (string) $variantA->id, 'quantity' => 2],
            ['variantId' => (string) $variantB->id, 'quantity' => 3],
        ],
        'delivery' => validDelivery(),
    ])->assertCreated();

    $expectedSubtotal = (10000 * 2) + (5000 * 3);
    $orderNumber = $response->json('data.orderNumber');

    $this->assertDatabaseHas('orders', ['order_number' => $orderNumber, 'subtotal_pesewas' => $expectedSubtotal]);
    $this->assertDatabaseCount('order_items', 2);
});
