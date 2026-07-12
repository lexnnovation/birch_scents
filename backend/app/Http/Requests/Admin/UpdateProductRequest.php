<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $product = $this->route('product');

        return [
            'categorySlug' => ['sometimes', 'string', 'exists:categories,slug'],
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'alpha_dash', Rule::unique('products', 'slug')->ignore($product)],
            'tagline' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'scentNotes' => ['sometimes', 'string', 'max:255'],
            'imageUrl' => ['nullable', 'string', 'url'],
            'gallery' => ['sometimes', 'array'],
            'gallery.*' => ['string', 'url'],
            'isFeatured' => ['sometimes', 'boolean'],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }

    /** Snake_case attributes for the Product model — only the keys actually present. */
    public function toModelAttributes(): array
    {
        $map = [
            'name' => 'name',
            'slug' => 'slug',
            'tagline' => 'tagline',
            'description' => 'description',
            'scentNotes' => 'scent_notes',
            'imageUrl' => 'image_url',
            'gallery' => 'gallery',
            'isFeatured' => 'is_featured',
            'isActive' => 'is_active',
        ];

        $data = $this->validated();
        $attributes = [];

        foreach ($map as $camel => $snake) {
            if (array_key_exists($camel, $data)) {
                $attributes[$snake] = $data[$camel];
            }
        }

        return $attributes;
    }
}
