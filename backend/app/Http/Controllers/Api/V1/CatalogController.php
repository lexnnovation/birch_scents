<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductIndexRequest;
use App\Services\CatalogCache;
use Illuminate\Http\JsonResponse;

/**
 * Public, unauthenticated catalog reads. Only active categories/products/
 * variants are ever surfaced here (CLAUDE.md §5) — admin endpoints see the
 * full catalog including inactive rows.
 *
 * Nothing in this controller touches the database. Every read is served from
 * the materialised snapshot in CatalogCache, which filters, searches and
 * paginates in memory; see that class for why the whole catalog is cached as
 * one entry rather than per query.
 */
class CatalogController extends Controller
{
    public function __construct(private readonly CatalogCache $catalog) {}

    public function categories(): JsonResponse
    {
        return $this->cacheable(response()->json([
            'data' => $this->catalog->categories(),
        ]));
    }

    public function products(ProductIndexRequest $request): JsonResponse
    {
        $data = $request->validated();
        $perPage = (int) ($data['perPage'] ?? 20);
        $page = (int) ($data['page'] ?? 1);

        $products = $this->filter($this->catalog->products(), $data);
        $total = count($products);

        return $this->cacheable(response()->json([
            'data' => array_values(array_slice($products, ($page - 1) * $perPage, $perPage)),
            'meta' => [
                'currentPage' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'lastPage' => (int) max(1, ceil($total / $perPage)),
            ],
        ]));
    }

    public function show(string $product): JsonResponse
    {
        $found = $this->catalog->findProduct($product);

        // Inactive products are never in the snapshot, so an inactive slug and
        // an unknown slug are indistinguishable here — both 404, as before.
        abort_if($found === null, 404);

        return $this->cacheable(response()->json(['data' => $found]));
    }

    /**
     * @param  list<array<string, mixed>>  $products
     * @param  array<string, mixed>  $data
     * @return list<array<string, mixed>>
     */
    private function filter(array $products, array $data): array
    {
        if (! empty($data['category'])) {
            $products = array_filter(
                $products,
                fn ($p) => $p['categorySlug'] === $data['category'],
            );
        }

        if (array_key_exists('featured', $data)) {
            $featured = filter_var($data['featured'], FILTER_VALIDATE_BOOLEAN);
            $products = array_filter($products, fn ($p) => $p['isFeatured'] === $featured);
        }

        if (! empty($data['search'])) {
            // Matching in PHP rather than SQL removes the LIKE-pattern problem
            // altogether: the term is compared as literal text, so a "%" or "_"
            // in a search box is just a character on every database driver —
            // no escaping, and no injection surface at all.
            $products = array_filter($products, function ($p) use ($data) {
                foreach (['name', 'tagline', 'scentNotes'] as $field) {
                    if ($p[$field] !== null && mb_stripos($p[$field], $data['search']) !== false) {
                        return true;
                    }
                }

                return false;
            });
        }

        return array_values($products);
    }

    /**
     * Public catalog responses carry real cache headers so browsers and any CDN
     * in front of the API can serve them without reaching origin at all.
     * `stale-while-revalidate` is the important one under load: the edge answers
     * instantly from a stale copy and refreshes once in the background, so a
     * traffic spike can never stampede through to Postgres.
     *
     * Stock ships inside these payloads, so an edge copy can be up to s-maxage
     * stale. That is deliberate and safe: checkout re-validates stock
     * server-side and returns 409 (CLAUDE.md §5), which is already the outcome
     * for any two shoppers racing for the last unit.
     */
    private function cacheable(JsonResponse $response): JsonResponse
    {
        return $response->header(
            'Cache-Control',
            'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
        );
    }
}
