<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Http;

/** Posts a Paystack-shaped webhook with a correctly (or deliberately incorrectly) signed body. */
function postPaystackWebhook(array $payload, ?string $signingSecret = null): \Illuminate\Testing\TestResponse
{
    $content = json_encode($payload, 0);
    $secret = $signingSecret ?? config('services.paystack.secret');
    $signature = hash_hmac('sha512', $content, $secret);

    return test()->postJson('/api/v1/webhooks/paystack', $payload, ['x-paystack-signature' => $signature]);
}

function chargeSuccessPayload(string $reference, array $overrides = []): array
{
    return [
        'event' => 'charge.success',
        'data' => array_merge([
            'reference' => $reference,
            'amount' => 26500,
            'currency' => 'GHS',
            'status' => 'success',
        ], $overrides),
    ];
}

it('rejects a webhook with no signature header', function () {
    $this->postJson('/api/v1/webhooks/paystack', chargeSuccessPayload('bs_ref_1'))->assertStatus(401);
});

it('rejects a webhook with a bad signature', function () {
    postPaystackWebhook(chargeSuccessPayload('bs_ref_1'), signingSecret: 'wrong-secret')->assertStatus(401);
});

it('returns 200 for an unhandled event type without changing anything', function () {
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);
    $payment = Payment::factory()->for($order)->create(['status' => PaymentStatus::Pending, 'reference' => 'bs_ref_2']);

    postPaystackWebhook(['event' => 'transfer.success', 'data' => ['reference' => 'bs_ref_2']])->assertOk();

    expect($payment->fresh()->status)->toBe(PaymentStatus::Pending);
    expect($order->fresh()->status)->toBe(OrderStatus::Pending);
});

it('returns 200 for an unknown reference without fulfilling anything', function () {
    postPaystackWebhook(chargeSuccessPayload('bs_does_not_exist'))->assertOk();

    $this->assertDatabaseCount('orders', 0);
});

it('marks payment success, order paid, and decrements stock on a verified charge.success', function () {
    $variant = ProductVariant::factory()->create(['stock' => 10]);
    $order = Order::factory()->create(['status' => OrderStatus::Pending, 'total_pesewas' => 26500]);
    $order->items()->create([
        'product_variant_id' => $variant->id,
        'product_name' => 'Test Product',
        'variant_label' => $variant->label,
        'unit_price_pesewas' => 26500,
        'quantity' => 3,
        'line_total_pesewas' => 26500 * 3,
    ]);
    $payment = Payment::factory()->for($order)->create([
        'status' => PaymentStatus::Pending,
        'reference' => 'bs_ref_success',
        'amount_pesewas' => 26500,
        'currency' => 'GHS',
    ]);

    fakePaystackVerify(['reference' => 'bs_ref_success', 'amount' => 26500, 'currency' => 'GHS', 'status' => 'success']);

    postPaystackWebhook(chargeSuccessPayload('bs_ref_success'))->assertOk();

    expect($payment->fresh()->status)->toBe(PaymentStatus::Success);
    expect($payment->fresh()->paid_at)->not->toBeNull();
    expect($order->fresh()->status)->toBe(OrderStatus::Paid);
    expect($variant->fresh()->stock)->toBe(7); // 10 - 3
});

it('is idempotent on a replayed webhook (does not double-decrement stock)', function () {
    $variant = ProductVariant::factory()->create(['stock' => 10]);
    $order = Order::factory()->create(['status' => OrderStatus::Pending, 'total_pesewas' => 26500]);
    $order->items()->create([
        'product_variant_id' => $variant->id,
        'product_name' => 'Test Product',
        'variant_label' => $variant->label,
        'unit_price_pesewas' => 26500,
        'quantity' => 3,
        'line_total_pesewas' => 26500 * 3,
    ]);
    Payment::factory()->for($order)->create([
        'status' => PaymentStatus::Pending,
        'reference' => 'bs_ref_replay',
        'amount_pesewas' => 26500,
        'currency' => 'GHS',
    ]);

    fakePaystackVerify(['reference' => 'bs_ref_replay', 'amount' => 26500, 'currency' => 'GHS', 'status' => 'success']);

    postPaystackWebhook(chargeSuccessPayload('bs_ref_replay'))->assertOk();
    postPaystackWebhook(chargeSuccessPayload('bs_ref_replay'))->assertOk();

    expect($variant->fresh()->stock)->toBe(7); // decremented once, not twice
});

it('does not fulfill when the verified amount does not match our record', function () {
    $variant = ProductVariant::factory()->create(['stock' => 10]);
    $order = Order::factory()->create(['status' => OrderStatus::Pending, 'total_pesewas' => 26500]);
    $order->items()->create([
        'product_variant_id' => $variant->id,
        'product_name' => 'Test Product',
        'variant_label' => $variant->label,
        'unit_price_pesewas' => 26500,
        'quantity' => 1,
        'line_total_pesewas' => 26500,
    ]);
    $payment = Payment::factory()->for($order)->create([
        'status' => PaymentStatus::Pending,
        'reference' => 'bs_ref_mismatch',
        'amount_pesewas' => 26500,
        'currency' => 'GHS',
    ]);

    // Verify API reports a different (tampered/short-paid) amount than our record.
    fakePaystackVerify(['reference' => 'bs_ref_mismatch', 'amount' => 100, 'currency' => 'GHS', 'status' => 'success']);

    postPaystackWebhook(chargeSuccessPayload('bs_ref_mismatch', ['amount' => 100]))->assertOk();

    expect($payment->fresh()->status)->toBe(PaymentStatus::Pending);
    expect($order->fresh()->status)->toBe(OrderStatus::Pending);
    expect($variant->fresh()->stock)->toBe(10);
});

it('does not fulfill when Paystack verification itself fails', function () {
    $variant = ProductVariant::factory()->create(['stock' => 10]);
    $order = Order::factory()->create(['status' => OrderStatus::Pending, 'total_pesewas' => 26500]);
    $payment = Payment::factory()->for($order)->create([
        'status' => PaymentStatus::Pending,
        'reference' => 'bs_ref_verify_down',
        'amount_pesewas' => 26500,
        'currency' => 'GHS',
    ]);

    Http::fake(['api.paystack.co/transaction/verify/*' => Http::response(['status' => false], 500)]);

    postPaystackWebhook(chargeSuccessPayload('bs_ref_verify_down'))->assertOk();

    expect($payment->fresh()->status)->toBe(PaymentStatus::Pending);
    expect($order->fresh()->status)->toBe(OrderStatus::Pending);
});
