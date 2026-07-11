<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

/**
 * Mirrors frontend/src/mocks/categories.ts exactly so the live API is a
 * drop-in replacement for the mock data layer (CLAUDE.md §5, PROJECT_TODO 6.6).
 */
class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Reed Diffusers',
                'slug' => 'reed-diffusers',
                'description' => 'Slow, steady fragrance that fills a room without a flame — our most-loved way to scent a home.',
                'sort_order' => 1,
            ],
            [
                'name' => 'Room Sprays',
                'slug' => 'room-sprays',
                'description' => 'An instant lift for any space — a few mists to refresh, welcome, and set the mood.',
                'sort_order' => 2,
            ],
            [
                'name' => 'Fragrance Oils',
                'slug' => 'fragrance-oils',
                'description' => 'Concentrated oils for burners, diffusers, and humidifiers — rich, long-lasting scent throw.',
                'sort_order' => 3,
            ],
            [
                'name' => 'Humidifiers',
                'slug' => 'humidifiers',
                'description' => 'Quiet ultrasonic humidifiers that carry fragrance as a fine, cool mist through the air.',
                'sort_order' => 4,
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
