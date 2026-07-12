<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreVariantRequest;
use App\Http\Requests\Admin\UpdateVariantRequest;
use App\Http\Resources\ProductVariantResource;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class ProductVariantController extends Controller
{
    public function store(StoreVariantRequest $request, Product $product): JsonResponse
    {
        $variant = $product->variants()->create($request->toModelAttributes());

        return response()->json(['data' => new ProductVariantResource($variant)], 201);
    }

    public function update(UpdateVariantRequest $request, ProductVariant $variant): JsonResponse
    {
        $variant->update($request->toModelAttributes());

        return response()->json(['data' => new ProductVariantResource($variant)]);
    }

    public function destroy(ProductVariant $variant): Response
    {
        $variant->delete();

        return response()->noContent();
    }
}
