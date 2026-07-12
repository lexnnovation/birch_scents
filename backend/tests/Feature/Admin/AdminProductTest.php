<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Str;

it('forbids non-admins from every admin product route', function () {
    $user = User::factory()->create(['supabase_id' => (string) Str::uuid()]);
    $token = tokenFor($user->supabase_id);
    $product = Product::factory()->create();

    $this->withToken($token)->getJson('/api/v1/admin/products')->assertStatus(403);
    $this->withToken($token)->postJson('/api/v1/admin/products', [])->assertStatus(403);
    $this->withToken($token)->patchJson("/api/v1/admin/products/{$product->slug}", [])->assertStatus(403);
    $this->withToken($token)->deleteJson("/api/v1/admin/products/{$product->slug}")->assertStatus(403);
});

it('lists the full catalog including inactive products for admins', function () {
    [, $token] = adminUserAndToken();
    Product::factory()->create(['name' => 'Active One']);
    Product::factory()->inactive()->create(['name' => 'Inactive One']);

    $response = $this->withToken($token)->getJson('/api/v1/admin/products')->assertOk();

    expect($response->json('meta.total'))->toBe(2);
});

it('creates a product with a variant', function () {
    [, $token] = adminUserAndToken();
    $category = Category::factory()->create(['slug' => 'reed-diffusers']);

    $response = $this->withToken($token)->postJson('/api/v1/admin/products', [
        'categorySlug' => 'reed-diffusers',
        'name' => 'Test Scent',
        'slug' => 'test-scent',
        'tagline' => 'A test tagline',
        'description' => 'A test description.',
        'scentNotes' => 'Test, notes',
        'isFeatured' => false,
        'isActive' => true,
    ])->assertCreated();

    $response->assertJsonPath('data.slug', 'test-scent');
    $response->assertJsonPath('data.categorySlug', 'reed-diffusers');
    $this->assertDatabaseHas('products', ['slug' => 'test-scent', 'category_id' => $category->id]);
});

it('validates product creation input', function () {
    [, $token] = adminUserAndToken();

    $this->withToken($token)->postJson('/api/v1/admin/products', [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['categorySlug', 'name', 'slug', 'tagline', 'description', 'scentNotes']);
});

it('updates a product', function () {
    [, $token] = adminUserAndToken();
    $product = Product::factory()->create(['name' => 'Old Name', 'is_active' => true]);

    $response = $this->withToken($token)->patchJson("/api/v1/admin/products/{$product->slug}", [
        'name' => 'New Name',
        'isActive' => false,
    ])->assertOk();

    $response->assertJsonPath('data.name', 'New Name');
    $response->assertJsonPath('data.isActive', false);
});

it('deletes a product', function () {
    [, $token] = adminUserAndToken();
    $product = Product::factory()->create();

    $this->withToken($token)->deleteJson("/api/v1/admin/products/{$product->slug}")->assertNoContent();

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

it('creates, updates, and deletes a variant under a product', function () {
    [, $token] = adminUserAndToken();
    $product = Product::factory()->create();

    $created = $this->withToken($token)->postJson("/api/v1/admin/products/{$product->slug}/variants", [
        'label' => 'Standard',
        'sku' => 'BS-TEST-STD',
        'pricePesewas' => 5000,
        'stock' => 10,
    ])->assertCreated();

    $variantId = $created->json('data.id');

    $this->withToken($token)->patchJson("/api/v1/admin/variants/{$variantId}", [
        'pricePesewas' => 6000,
    ])->assertOk()->assertJsonPath('data.pricePesewas', 6000);

    $this->withToken($token)->deleteJson("/api/v1/admin/variants/{$variantId}")->assertNoContent();
    $this->assertDatabaseMissing('product_variants', ['id' => $variantId]);
});

it('updates variant stock via the dedicated inventory endpoint', function () {
    [, $token] = adminUserAndToken();
    $variant = ProductVariant::factory()->create(['stock' => 5]);

    $this->withToken($token)
        ->patchJson("/api/v1/admin/variants/{$variant->id}/stock", ['stock' => 42])
        ->assertOk()
        ->assertJsonPath('data.stock', 42);

    expect($variant->fresh()->stock)->toBe(42);
});
