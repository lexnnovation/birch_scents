<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

/** Counts every query executed while running the given callback. */
function countQueries(Closure $callback): int
{
    $count = 0;
    DB::listen(function () use (&$count) {
        $count++;
    });

    $callback();

    return $count;
}

it('serves every public catalog read from cache without touching the database', function () {
    $category = Category::factory()->create(['slug' => 'reed-diffusers']);
    Product::factory()->count(3)->create(['category_id' => $category->id]);
    $product = Product::factory()->create(['slug' => 'snow-melon', 'category_id' => $category->id]);
    ProductVariant::factory()->create(['product_id' => $product->id]);

    // Warm the snapshot — this is the one read allowed to reach Postgres.
    $this->getJson('/api/v1/products')->assertOk();

    // Every shape of public read, including permutations that per-query caching
    // would each treat as a separate key and a separate database hit.
    $queries = countQueries(function () {
        $this->getJson('/api/v1/categories')->assertOk();
        $this->getJson('/api/v1/products')->assertOk();
        $this->getJson('/api/v1/products?page=2&perPage=2')->assertOk();
        $this->getJson('/api/v1/products?category=reed-diffusers')->assertOk();
        $this->getJson('/api/v1/products?featured=true')->assertOk();
        $this->getJson('/api/v1/products?search=melon')->assertOk();
        $this->getJson('/api/v1/products/snow-melon')->assertOk();
    });

    expect($queries)->toBe(0);
});

it('rebuilds the snapshot when a product is edited', function () {
    $product = Product::factory()->create(['name' => 'Original Name']);
    $this->getJson('/api/v1/products')->assertOk();

    $product->update(['name' => 'Renamed Product']);

    $names = collect($this->getJson('/api/v1/products')->json('data'))->pluck('name');
    expect($names)->toContain('Renamed Product')->not->toContain('Original Name');
});

it('rebuilds the snapshot when a product is deleted', function () {
    $product = Product::factory()->create(['name' => 'Discontinued']);
    $this->getJson('/api/v1/products')->assertOk();

    $product->delete();

    expect($this->getJson('/api/v1/products')->json('data'))->toHaveCount(0);
});

it('rebuilds the snapshot when variant stock changes', function () {
    // The Paystack webhook decrements stock through the model after a payment,
    // and stock ships inside the cached product payload — so this is the path
    // that would otherwise serve a sold-out variant as in stock.
    $product = Product::factory()->create(['slug' => 'snow-melon']);
    $variant = ProductVariant::factory()->create(['product_id' => $product->id, 'stock' => 10]);
    $this->getJson('/api/v1/products/snow-melon')->assertOk();

    $variant->update(['stock' => 3]);

    $response = $this->getJson('/api/v1/products/snow-melon')->assertOk();
    expect($response->json('data.variants.0.stock'))->toBe(3);
});

it('rebuilds the snapshot when a category is edited', function () {
    $category = Category::factory()->create(['name' => 'Old Name']);
    $this->getJson('/api/v1/categories')->assertOk();

    $category->update(['name' => 'New Name']);

    $names = collect($this->getJson('/api/v1/categories')->json('data'))->pluck('name');
    expect($names)->toContain('New Name')->not->toContain('Old Name');
});

it('sends CDN-cacheable headers on public catalog responses', function () {
    Product::factory()->create(['slug' => 'snow-melon']);

    foreach (['/api/v1/categories', '/api/v1/products', '/api/v1/products/snow-melon'] as $url) {
        $header = $this->getJson($url)->assertOk()->headers->get('Cache-Control');

        expect($header)
            ->toContain('public')
            ->toContain('s-maxage=300')
            ->toContain('stale-while-revalidate=86400');
    }
});

it('keeps pagination meta correct when filtering an empty result set', function () {
    Product::factory()->create(['name' => 'Snow Melon']);

    $response = $this->getJson('/api/v1/products?search=nothing-matches-this')->assertOk();

    expect($response->json('data'))->toHaveCount(0);
    expect($response->json('meta.total'))->toBe(0);
    expect($response->json('meta.lastPage'))->toBe(1);
});

it('treats search wildcards as literal text on every database driver', function () {
    // In-memory matching removes the LIKE-pattern escaping problem entirely,
    // so this guarantee no longer depends on the Postgres escape character.
    Product::factory()->create(['name' => 'Snow Melon']);
    Product::factory()->create(['name' => '100% Pure Oil']);

    $names = collect($this->getJson('/api/v1/products?search='.urlencode('%'))->json('data'))
        ->pluck('name');

    expect($names)->toContain('100% Pure Oil')->not->toContain('Snow Melon');
});
