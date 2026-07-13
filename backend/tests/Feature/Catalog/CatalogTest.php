<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;

it('lists categories ordered by sort_order with camelCase keys', function () {
    Category::factory()->create(['name' => 'Second', 'sort_order' => 2]);
    Category::factory()->create(['name' => 'First', 'sort_order' => 1]);

    $response = $this->getJson('/api/v1/categories')->assertOk();

    $response->assertJsonPath('data.0.name', 'First');
    $response->assertJsonPath('data.1.name', 'Second');
    $response->assertJsonStructure(['data' => [['id', 'name', 'slug', 'description', 'imageUrl', 'sortOrder']]]);
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
