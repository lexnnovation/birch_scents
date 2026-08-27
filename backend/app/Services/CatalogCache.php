<?php

namespace App\Services;

use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;

/**
 * The public catalog is small (tens of products) and changes rarely, so the
 * whole active catalog is materialised into ONE cache entry, and every public
 * read — category list, filter, search, pagination, single product — is served
 * out of it in memory.
 *
 * Caching per query instead would fragment across permutations
 * (?category=…&page=…&search=…): each is its own key, its own miss, its own DB
 * hit, so a crawler walking those permutations defeats the cache entirely. One
 * entry means the hit rate stays ~100% no matter which URLs are requested, and
 * Postgres is read once per catalog write or once per TTL — never once per
 * visitor. That is what keeps Supabase egress flat as traffic grows, instead
 * of scaling with it.
 *
 * Because it is a single entry, invalidation is a single forget() — no key
 * versioning or cache tags needed (the `file` store supports neither).
 *
 * This approach holds while the catalog fits comfortably in memory. Past
 * roughly a thousand products, revisit it — paginate at the database again and
 * cache per query, or move the snapshot to Redis.
 */
class CatalogCache
{
    private const KEY = 'catalog:snapshot';

    /**
     * @return array{products: list<array<string, mixed>>, categories: list<array<string, mixed>>}
     */
    public function snapshot(): array
    {
        return Cache::remember(self::KEY, config('catalog.cache_ttl'), fn () => $this->build());
    }

    /** @return list<array<string, mixed>> */
    public function products(): array
    {
        return $this->snapshot()['products'];
    }

    /** @return list<array<string, mixed>> */
    public function categories(): array
    {
        return $this->snapshot()['categories'];
    }

    /** @return array<string, mixed>|null */
    public function findProduct(string $slug): ?array
    {
        foreach ($this->products() as $product) {
            if ($product['slug'] === $slug) {
                return $product;
            }
        }

        return null;
    }

    /** Drop the snapshot so the next public read rebuilds it from Postgres. */
    public function flush(): void
    {
        Cache::forget(self::KEY);
    }

    /**
     * The only place the public catalog touches the database. Mirrors exactly
     * what the public endpoints are allowed to surface (CLAUDE.md §5): active
     * products, each with only its active variants.
     *
     * @return array{products: list<array<string, mixed>>, categories: list<array<string, mixed>>}
     */
    private function build(): array
    {
        $products = Product::query()
            ->where('is_active', true)
            ->with(['category', 'variants' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('name')
            ->get();

        // Rendered through the API Resources and round-tripped via JSON so the
        // snapshot holds plain arrays in exactly the shape the endpoints emit —
        // nested variant resources included. A cache hit is then a straight
        // array read with no model hydration or re-serialisation.
        return [
            'products' => json_decode(ProductResource::collection($products)->toJson(), true),
            'categories' => json_decode(CategoryResource::collection(
                Category::orderBy('sort_order')->get()
            )->toJson(), true),
        ];
    }
}
