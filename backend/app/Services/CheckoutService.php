<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Exceptions\CheckoutFailedException;
use App\Models\Order;
use App\Models\Payment;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Re-prices and validates the cart server-side at checkout time (CLAUDE.md
 * §8, §10) — client-sent prices/totals are never trusted. Stock is only
 * *checked* here, not decremented: decrementing happens exclusively in the
 * Paystack webhook's success handler once payment is verified (CLAUDE.md §9),
 * so an abandoned checkout never leaves stock permanently reserved.
 */
class CheckoutService
{
    public function __construct(private readonly PaystackService $paystackService) {}

    /** @return array{order: Order, authorizationUrl: string, accessCode: string} */
    public function checkout(User $user, array $items, array $delivery): array
    {
        return DB::transaction(function () use ($user, $items, $delivery) {
            $variantIds = array_column($items, 'variantId');

            $variants = ProductVariant::query()
                ->whereIn('id', $variantIds)
                ->with('product')
                ->get()
                ->keyBy('id');

            $subtotal = 0;
            $lines = [];

            foreach ($items as $item) {
                $variant = $variants->get($item['variantId']);

                if (! $variant || ! $variant->is_active || ! $variant->product?->is_active) {
                    throw new CheckoutFailedException('One or more items in your cart are no longer available.');
                }

                $quantity = (int) $item['quantity'];

                if ($variant->stock < $quantity) {
                    throw new CheckoutFailedException(
                        "Insufficient stock for {$variant->product->name} ({$variant->label}).",
                    );
                }

                $lineTotal = $variant->price_pesewas * $quantity;
                $subtotal += $lineTotal;

                $lines[] = ['variant' => $variant, 'quantity' => $quantity, 'lineTotal' => $lineTotal];
            }

            $deliveryFee = config('checkout.delivery_fee_pesewas');
            $total = $subtotal + $deliveryFee;

            $order = Order::create([
                'order_number' => $this->generateOrderNumber(),
                'user_id' => $user->id,
                'status' => OrderStatus::Pending,
                'subtotal_pesewas' => $subtotal,
                'delivery_fee_pesewas' => $deliveryFee,
                'total_pesewas' => $total,
                'delivery_name' => $delivery['name'],
                'delivery_phone' => $delivery['phone'],
                'delivery_address' => $delivery['address'],
                'delivery_city' => $delivery['city'],
                'delivery_note' => $delivery['note'] ?? null,
            ]);

            foreach ($lines as $line) {
                $order->items()->create([
                    'product_variant_id' => $line['variant']->id,
                    'product_name' => $line['variant']->product->name,
                    'variant_label' => $line['variant']->label,
                    'unit_price_pesewas' => $line['variant']->price_pesewas,
                    'quantity' => $line['quantity'],
                    'line_total_pesewas' => $line['lineTotal'],
                ]);
            }

            $reference = $this->generatePaymentReference();

            $order->payment()->create([
                'provider' => 'paystack',
                'reference' => $reference,
                'status' => PaymentStatus::Pending,
                'amount_pesewas' => $total,
                'currency' => 'GHS',
            ]);

            // Initialized inside the transaction: if Paystack is unreachable
            // or rejects the request, the whole checkout rolls back rather
            // than leaving an orphaned pending order.
            $callbackUrl = rtrim(config('checkout.frontend_url'), '/')
                .'/checkout/callback?orderNumber='.urlencode($order->order_number);

            $init = $this->paystackService->initializeTransaction(
                email: $user->email,
                amountPesewas: $total,
                reference: $reference,
                callbackUrl: $callbackUrl,
            );

            return [
                'order' => $order->load('items', 'payment'),
                'authorizationUrl' => $init['authorizationUrl'],
                'accessCode' => $init['accessCode'],
            ];
        });
    }

    private function generateOrderNumber(): string
    {
        $year = now()->year;

        do {
            $sequence = str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT);
            $candidate = "BS-{$year}-{$sequence}";
        } while (Order::where('order_number', $candidate)->exists());

        return $candidate;
    }

    private function generatePaymentReference(): string
    {
        do {
            $candidate = 'bs_'.Str::random(24);
        } while (Payment::where('reference', $candidate)->exists());

        return $candidate;
    }
}
