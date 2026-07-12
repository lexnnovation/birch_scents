<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductIndexRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

/**
 * Public, unauthenticated catalog reads. Only active categories/products/
 * variants are ever surfaced here (CLAUDE.md §5) — admin endpoints see the
 * full catalog including inactive rows.
 */
class CatalogController extends Controller
{
    public function categories(): JsonResponse
    {
        $categories = Category::orderBy('sort_order')->get();

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ]);
    }

    public function products(ProductIndexRequest $request): JsonResponse
    {
        $data = $request->validated();
        $perPage = $data['perPage'] ?? 20;

        $query = Product::query()
            ->where('is_active', true)
            ->with(['category', 'variants' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('name');

        if (! empty($data['category'])) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $data['category']));
        }

        if (array_key_exists('featured', $data)) {
            $query->where('is_featured', filter_var($data['featured'], FILTER_VALIDATE_BOOLEAN));
        }

        $paginator = $query->paginate($perPage, page: $data['page'] ?? 1);

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

    public function show(Product $product): JsonResponse
    {
        abort_unless($product->is_active, 404);

        $product->load(['category', 'variants' => fn ($q) => $q->where('is_active', true)]);

        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }
}
