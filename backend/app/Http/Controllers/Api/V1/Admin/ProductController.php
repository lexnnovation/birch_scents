<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Admin manages the whole catalog, including inactive products/variants —
 * unlike CatalogController, nothing here is filtered by is_active.
 */
class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->integer('perPage', 20), 100);

        $paginator = Product::query()
            ->with(['category', 'variants'])
            ->orderBy('name')
            ->paginate($perPage, page: max((int) $request->integer('page', 1), 1));

        return response()->json([
            'data' => ProductResource::collection($paginator->items()),
            'meta' => [
                'currentPage' => $paginator->currentPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
                'lastPage' => $paginator->lastPage(),
            ],
        ]);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $categoryId = Category::where('slug', $request->validated()['categorySlug'])->value('id');

        $product = Product::create([...$request->toModelAttributes(), 'category_id' => $categoryId]);

        return response()->json(['data' => new ProductResource($product->load(['category', 'variants']))], 201);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $attributes = $request->toModelAttributes();

        if (array_key_exists('categorySlug', $request->validated())) {
            $attributes['category_id'] = Category::where('slug', $request->validated()['categorySlug'])->value('id');
        }

        $product->update($attributes);

        return response()->json(['data' => new ProductResource($product->load(['category', 'variants']))]);
    }

    public function destroy(Product $product): Response
    {
        $product->delete();

        return response()->noContent();
    }
}
