<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->integer('perPage', 20), 100);

        $query = Order::query()->with('items.variant.product')->latest();

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        $paginator = $query->paginate($perPage, page: max((int) $request->integer('page', 1), 1));

        return response()->json([
            'data' => OrderResource::collection($paginator->items()),
            'meta' => [
                'currentPage' => $paginator->currentPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
                'lastPage' => $paginator->lastPage(),
            ],
        ]);
    }

    public function update(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $next = OrderStatus::from($request->validated()['status']);

        if (! $order->status->canTransitionTo($next)) {
            throw ValidationException::withMessages([
                'status' => "Cannot transition an order from {$order->status->value} to {$next->value}.",
            ]);
        }

        $order->update(['status' => $next]);

        return response()->json(['data' => new OrderResource($order->load('items.variant.product'))]);
    }
}
