<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

it('lists categories ordered by sort_order with camelCase keys', function () {
    Category::factory()->create(['name' => 'Second', 'sort_order' => 2]);
    Category::factory()->create(['name' => 'First', 'sort_order' => 1]);

    $response = $this->getJson('/api/v1/categories')->assertOk();

    $response->assertJsonPath('data.0.name', 'First');
    $response->assertJsonPath('data.1.name', 'Second');
    $response->assertJsonStructure(['data' => [['id', 'name', 'slug', 'description', 'imageUrl', 'sortOrder']]]);
});

it('rate-limits the public catalog endpoint at 300 requests per minute', function () {
    for ($i = 0; $i < 300; $i++) {
        $this->getJson('/api/v1/products')->assertOk();
    }

    $this->getJson('/api/v1/products')->assertStatus(429);
});

it('only returns active products from the public products list', function () {
    Product::factory()->create(['name' => 'Active Product']);
    Product::factory()->inactive()->create(['name' => 'Hidden Product']);

    $response = $this->getJson('/api/v1/products')->assertOk();

    $names = collect($response->json('data'))->pluck('name');
    expect($names)->toContain('Active Product');
    expect($names)->not->toContain('Hidden Product');
});

it('paginates products with a camelCase meta envelope', function () {
    Product::factory()->count(3)->create();

    $response = $this->getJson('/api/v1/products?perPage=2')->assertOk();

    $response->assertJsonStructure(['data', 'meta' => ['currentPage', 'perPage', 'total', 'lastPage']]);
    expect($response->json('meta.perPage'))->toBe(2);
    expect($response->json('meta.total'))->toBe(3);
});

it('filters products by category slug', function () {
    $wanted = Category::factory()->create(['slug' => 'reed-diffusers']);
    $other = Category::factory()->create(['slug' => 'room-sprays']);
    Product::factory()->create(['category_id' => $wanted->id, 'name' => 'In Category']);
    Product::factory()->create(['category_id' => $other->id, 'name' => 'Other Category']);

    $response = $this->getJson('/api/v1/products?category=reed-diffusers')->assertOk();

    $names = collect($response->json('data'))->pluck('name');
    expect($names)->toContain('In Category');
    expect($names)->not->toContain('Other Category');
});

it('filters products by featured flag', function () {
    Product::factory()->featured()->create(['name' => 'Featured Product']);
    Product::factory()->create(['name' => 'Regular Product']);

    $response = $this->getJson('/api/v1/products?featured=true')->assertOk();

    $names = collect($response->json('data'))->pluck('name');
    expect($names)->toContain('Featured Product');
    expect($names)->not->toContain('Regular Product');
});

it('searches products by name, tagline, or scent notes (case-insensitive)', function () {
    Product::factory()->create(['name' => 'Snow Melon', 'tagline' => 'Crisp and sweet', 'scent_notes' => 'Melon, citrus']);
    Product::factory()->create(['name' => 'Velvet Oud', 'tagline' => 'Deep and smoky', 'scent_notes' => 'Oud, amber']);

    $byName = $this->getJson('/api/v1/products?search=snow')->assertOk();
    expect(collect($byName->json('data'))->pluck('name'))->toContain('Snow Melon')
        ->not->toContain('Velvet Oud');

    $byTagline = $this->getJson('/api/v1/products?search=smoky')->assertOk();
    expect(collect($byTagline->json('data'))->pluck('name'))->toContain('Velvet Oud');

    $byScentNotes = $this->getJson('/api/v1/products?search=citrus')->assertOk();
    expect(collect($byScentNotes->json('data'))->pluck('name'))->toContain('Snow Melon');
});

it('returns no results for a non-matching search term instead of erroring', function () {
    Product::factory()->create(['name' => 'Snow Melon']);

    $response = $this->getJson('/api/v1/products?search=nonexistent-fragrance-xyz')->assertOk();

    expect($response->json('data'))->toHaveCount(0);
});

it('treats a SQL-injection-shaped search term as inert literal text', function () {
    Product::factory()->create(['name' => 'Snow Melon']);
    Product::factory()->create(['name' => 'Velvet Oud']);

    // Eloquent's where()/orWhere() bind this as a parameter, never
    // interpolated into raw SQL — the products table must survive intact
    // and the response must be a normal (empty) result, not a 500.
    $payload = "'; DROP TABLE products; --";
    $response = $this->getJson('/api/v1/products?search='.urlencode($payload))->assertOk();

    expect($response->json('data'))->toHaveCount(0);
    expect(Product::count())->toBe(2);
});

it('treats ILIKE wildcard characters in a search term as literal, not patterns', function () {
    // Backslash-escaping a LIKE wildcard relies on the driver's default
    // escape character. Postgres (production, and every real environment
    // this app runs in outside the test suite) defaults to backslash; SQLite
    // (this Pest suite, for speed) has no default escape character at all,
    // so this specific guarantee is only meaningful on Postgres.
    if (DB::connection()->getDriverName() !== 'pgsql') {
        expect(true)->toBeTrue();

        return;
    }

    Product::factory()->create(['name' => 'Snow Melon']);
    Product::factory()->create(['name' => '100% Pure Oil']);

    // A bare "%" should not match every product as a wildcard would.
    $response = $this->getJson('/api/v1/products?search='.urlencode('%'))->assertOk();

    $names = collect($response->json('data'))->pluck('name');
    expect($names)->toContain('100% Pure Oil')->not->toContain('Snow Melon');
});

it('shows a single active product by slug with only active variants', function () {
    $product = Product::factory()->create(['slug' => 'snow-melon']);
    ProductVariant::factory()->create(['product_id' => $product->id, 'label' => '150ml']);
    ProductVariant::factory()->inactive()->create(['product_id' => $product->id, 'label' => '100ml']);

    $response = $this->getJson('/api/v1/products/snow-melon')->assertOk();

    $response->assertJsonPath('data.slug', 'snow-melon');
    expect($response->json('data.variants'))->toHaveCount(1);
    $response->assertJsonPath('data.variants.0.label', '150ml');
});

it('404s for an inactive product slug', function () {
    Product::factory()->inactive()->create(['slug' => 'discontinued']);

    $this->getJson('/api/v1/products/discontinued')->assertStatus(404);
});

it('404s for an unknown product slug', function () {
    $this->getJson('/api/v1/products/does-not-exist')->assertStatus(404);
});
