<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateStockRequest;
use App\Http\Resources\ProductVariantResource;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;

/** Inventory adjustment only — full variant CRUD lives in Admin\ProductVariantController. */
class VariantController extends Controller
{
    public function updateStock(UpdateStockRequest $request, ProductVariant $variant): JsonResponse
    {
        $variant->update(['stock' => $request->validated()['stock']]);

        return response()->json(['data' => new ProductVariantResource($variant)]);
    }
}
