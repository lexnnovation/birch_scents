<?php

namespace App\Services;

use App\Exceptions\PaystackException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Thin client for Paystack's Initialize + Verify Transaction endpoints
 * (CLAUDE.md §9). Amounts are pesewas throughout — Paystack already expects
 * minor units, so nothing is multiplied or divided here.
 */
class PaystackService
{
    private const BASE_URL = 'https://api.paystack.co';

    public function initializeTransaction(
        string $email,
        int $amountPesewas,
        string $reference,
        string $callbackUrl,
    ): array {
        try {
            $response = Http::withToken(config('services.paystack.secret'))
                ->timeout(10)
                ->post(self::BASE_URL.'/transaction/initialize', [
                    'email' => $email,
                    'amount' => $amountPesewas,
                    'currency' => 'GHS',
                    'reference' => $reference,
                    'callback_url' => $callbackUrl,
                ]);
        } catch (ConnectionException $e) {
            Log::error('Paystack initialize transaction: connection failure', ['reference' => $reference]);

            throw new PaystackException('Unable to reach Paystack. Please try again.', previous: $e);
        }

        if ($response->failed() || ! $response->json('status')) {
            Log::error('Paystack initialize transaction failed', [
                'reference' => $reference,
                'httpStatus' => $response->status(),
            ]);

            throw new PaystackException('Unable to initialize payment with Paystack. Please try again.');
        }

        return [
            'authorizationUrl' => $response->json('data.authorization_url'),
            'accessCode' => $response->json('data.access_code'),
        ];
    }

    public function verifyTransaction(string $reference): array
    {
        try {
            $response = Http::withToken(config('services.paystack.secret'))
                ->timeout(10)
                ->get(self::BASE_URL."/transaction/verify/{$reference}");
        } catch (ConnectionException $e) {
            Log::error('Paystack verify transaction: connection failure', ['reference' => $reference]);

            throw new PaystackException('Unable to reach Paystack. Please try again.', previous: $e);
        }

        if ($response->failed() || ! $response->json('status')) {
            Log::error('Paystack verify transaction failed', [
                'reference' => $reference,
                'httpStatus' => $response->status(),
            ]);

            throw new PaystackException('Unable to verify payment with Paystack.');
        }

        $data = $response->json('data');

        return [
            'status' => $data['status'] ?? null,
            'amountPesewas' => $data['amount'] ?? null,
            'currency' => $data['currency'] ?? null,
            'reference' => $data['reference'] ?? null,
            'paidAt' => $data['paid_at'] ?? null,
            'raw' => $data,
        ];
    }
}
