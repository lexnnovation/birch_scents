<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\ProductVariant */
class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'label' => $this->label,
            'sku' => $this->sku,
            'pricePesewas' => $this->price_pesewas,
            'compareAtPesewas' => $this->compare_at_pesewas,
            'stock' => $this->stock,
            'isActive' => $this->is_active,
        ];
    }
}
