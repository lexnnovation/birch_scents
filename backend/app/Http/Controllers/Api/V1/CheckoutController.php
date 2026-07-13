<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __construct(private readonly CheckoutService $checkoutService) {}

    public function store(CheckoutRequest $request): JsonResponse
    {
        $data = $request->validated();

        $result = $this->checkoutService->checkout($request->user(), $data['items'], $data['delivery']);
        $order = $result['order'];

        return response()->json(['data' => [
            'authorizationUrl' => $result['authorizationUrl'],
            'accessCode' => $result['accessCode'],
            'reference' => $order->payment->reference,
            'orderNumber' => $order->order_number,
        ]], 201);
    }
}
