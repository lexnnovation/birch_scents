<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Product */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'categorySlug' => $this->category?->slug,
            'categoryName' => $this->category?->name,
            'name' => $this->name,
            'slug' => $this->slug,
            'tagline' => $this->tagline,
            'description' => $this->description,
            'scentNotes' => $this->scent_notes,
            'imageUrl' => $this->image_url,
            'gallery' => $this->gallery ?? [],
            'isFeatured' => $this->is_featured,
            'isActive' => $this->is_active,
            'variants' => ProductVariantResource::collection($this->whenLoaded('variants')),
        ];
    }
}
