<?php

use Illuminate\Support\Facades\Http;

/**
 * Shared fakes for Paystack's Initialize/Verify Transaction endpoints
 * (CLAUDE.md §9) — Feature tests never make a real Paystack API call.
 */
function fakePaystackInitialize(string $authorizationUrl = 'https://checkout.paystack.com/fake-access-code'): void
{
    Http::fake([
        'api.paystack.co/transaction/initialize' => Http::response([
            'status' => true,
            'message' => 'Authorization URL created',
            'data' => [
                'authorization_url' => $authorizationUrl,
                'access_code' => 'fake-access-code',
                'reference' => 'fake-reference',
            ],
        ]),
    ]);
}

function fakePaystackVerify(array $overrides = []): void
{
    $data = array_merge([
        'status' => 'success',
        'reference' => 'fake-reference',
        'amount' => 26500,
        'currency' => 'GHS',
        'paid_at' => now()->toIso8601String(),
    ], $overrides);

    Http::fake([
        'api.paystack.co/transaction/verify/*' => Http::response([
            'status' => true,
            'message' => 'Verification successful',
            'data' => $data,
        ]),
    ]);
}
