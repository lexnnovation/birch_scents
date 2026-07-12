<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Gated by auth.supabase + admin route middleware.
        return true;
    }

    public function rules(): array
    {
        return [
            'categorySlug' => ['required', 'string', 'exists:categories,slug'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug', 'alpha_dash'],
            'tagline' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'scentNotes' => ['required', 'string', 'max:255'],
            'imageUrl' => ['nullable', 'string', 'url'],
            'gallery' => ['sometimes', 'array'],
            'gallery.*' => ['string', 'url'],
            'isFeatured' => ['sometimes', 'boolean'],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }

    /** Snake_case attributes for the Product model — the one translation point (CLAUDE.md §4). */
    public function toModelAttributes(): array
    {
        $data = $this->validated();

        return [
            'name' => $data['name'],
            'slug' => $data['slug'],
            'tagline' => $data['tagline'],
            'description' => $data['description'],
            'scent_notes' => $data['scentNotes'],
            'image_url' => $data['imageUrl'] ?? null,
            'gallery' => $data['gallery'] ?? [],
            'is_featured' => $data['isFeatured'] ?? false,
            'is_active' => $data['isActive'] ?? true,
        ];
    }
}
