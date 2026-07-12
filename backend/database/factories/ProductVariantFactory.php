<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ProductVariant> */
class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'label' => 'Standard',
            'sku' => 'SKU-'.$this->faker->unique()->bothify('####-????'),
            'price_pesewas' => $this->faker->numberBetween(5000, 30000),
            'compare_at_pesewas' => null,
            'stock' => $this->faker->numberBetween(10, 50),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }

    public function outOfStock(): static
    {
        return $this->state(['stock' => 0]);
    }
}
