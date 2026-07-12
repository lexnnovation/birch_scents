<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Customers only ever see their own orders (CLAUDE.md §10 rule 7) — scoped
 * by `user_id` at the query level, never by a client-supplied filter.
 */
class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->integer('perPage', 20), 100);

        $paginator = Order::query()
            ->where('user_id', $request->user()->id)
            ->with('items.variant.product')
            ->latest()
            ->paginate($perPage, page: max((int) $request->integer('page', 1), 1));

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

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->where('user_id', $request->user()->id)
            ->with('items.variant.product')
            ->first();

        abort_unless($order, 404);

        return response()->json([
            'data' => new OrderResource($order),
        ]);
    }
}
