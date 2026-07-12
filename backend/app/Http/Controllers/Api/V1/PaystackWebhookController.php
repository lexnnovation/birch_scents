<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Exceptions\PaystackException;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\ProductVariant;
use App\Services\PaystackService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * The only place an order becomes `paid` (CLAUDE.md §9). Always returns 200
 * for a validly-signed event — even ones we don't act on — so Paystack stops
 * retrying; only a bad signature gets a 401.
 */
class PaystackWebhookController extends Controller
{
    public function __construct(private readonly PaystackService $paystackService) {}

    public function handle(Request $request): JsonResponse
    {
        $rawBody = $request->getContent();
        $signature = $request->header('x-paystack-signature');
        $expected = hash_hmac('sha512', $rawBody, config('services.paystack.secret'));

        if (! $signature || ! hash_equals($expected, $signature)) {
            Log::warning('Paystack webhook: invalid signature');

            return response()->json(['message' => 'Invalid signature.'], 401);
        }

        $payload = json_decode($rawBody, true);

        if (($payload['event'] ?? null) !== 'charge.success') {
            return response()->json(['message' => 'ok']);
        }

        $reference = $payload['data']['reference'] ?? null;
        $payment = $reference ? Payment::where('reference', $reference)->first() : null;

        if (! $payment) {
            Log::warning('Paystack webhook: unknown reference', ['reference' => $reference]);

            return response()->json(['message' => 'ok']);
        }

        if ($payment->status === PaymentStatus::Success) {
            return response()->json(['message' => 'ok']);
        }

        try {
            $verification = $this->paystackService->verifyTransaction($reference);
        } catch (PaystackException) {
            Log::error('Paystack webhook: verification call failed', ['reference' => $reference]);

            return response()->json(['message' => 'ok']);
        }

        if ($verification['status'] !== 'success'
            || $verification['amountPesewas'] !== $payment->amount_pesewas
            || $verification['currency'] !== $payment->currency
        ) {
            Log::warning('Paystack webhook: verification mismatch — not fulfilling', [
                'reference' => $reference,
                'verifiedStatus' => $verification['status'],
                'verifiedAmount' => $verification['amountPesewas'],
                'expectedAmount' => $payment->amount_pesewas,
            ]);

            return response()->json(['message' => 'ok']);
        }

        DB::transaction(function () use ($payment, $verification) {
            // Re-check status under a row lock: two concurrent deliveries for
            // the same reference must not both pass the earlier (unlocked)
            // idempotency check and both decrement stock.
            $lockedPayment = Payment::whereKey($payment->id)->lockForUpdate()->first();

            if ($lockedPayment->status === PaymentStatus::Success) {
                return;
            }

            $lockedPayment->update([
                'status' => PaymentStatus::Success,
                'paid_at' => now(),
                'raw_payload' => $verification['raw'],
            ]);

            $order = $lockedPayment->order()->lockForUpdate()->first();
            $order->update(['status' => OrderStatus::Paid]);

            foreach ($order->items as $item) {
                if ($item->product_variant_id) {
                    ProductVariant::whereKey($item->product_variant_id)->decrement('stock', $item->quantity);
                }
            }
        });

        return response()->json(['message' => 'ok']);
    }
}
