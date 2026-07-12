<?php

use App\Exceptions\PaystackException;
use App\Services\PaystackService;
use Illuminate\Support\Facades\Http;

it('returns the authorization URL on a successful initialize call', function () {
    fakePaystackInitialize('https://checkout.paystack.com/abc123');

    $result = app(PaystackService::class)->initializeTransaction(
        email: 'shopper@example.com',
        amountPesewas: 26500,
        reference: 'bs_test_ref',
        callbackUrl: 'https://birchscents.test/checkout/callback',
    );

    expect($result['authorizationUrl'])->toBe('https://checkout.paystack.com/abc123');
});

it('throws PaystackException when initialize returns a failure response', function () {
    Http::fake(['api.paystack.co/transaction/initialize' => Http::response(['status' => false], 400)]);

    app(PaystackService::class)->initializeTransaction(
        email: 'shopper@example.com',
        amountPesewas: 26500,
        reference: 'bs_test_ref',
        callbackUrl: 'https://birchscents.test/checkout/callback',
    );
})->throws(PaystackException::class);

it('throws PaystackException (not a raw connection error) when Paystack times out or is unreachable', function () {
    Http::fake(['api.paystack.co/transaction/initialize' => fn () => throw new \Illuminate\Http\Client\ConnectionException('timed out')]);

    app(PaystackService::class)->initializeTransaction(
        email: 'shopper@example.com',
        amountPesewas: 26500,
        reference: 'bs_test_ref',
        callbackUrl: 'https://birchscents.test/checkout/callback',
    );
})->throws(PaystackException::class);

it('returns verification data on a successful verify call', function () {
    fakePaystackVerify(['reference' => 'bs_test_ref', 'amount' => 26500, 'currency' => 'GHS', 'status' => 'success']);

    $result = app(PaystackService::class)->verifyTransaction('bs_test_ref');

    expect($result['status'])->toBe('success');
    expect($result['amountPesewas'])->toBe(26500);
    expect($result['currency'])->toBe('GHS');
});

it('throws PaystackException when verify returns a failure response', function () {
    Http::fake(['api.paystack.co/transaction/verify/*' => Http::response(['status' => false], 404)]);

    app(PaystackService::class)->verifyTransaction('bs_unknown_ref');
})->throws(PaystackException::class);
