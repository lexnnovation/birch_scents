<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\OrderItem */
class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'productName' => $this->product_name,
            'variantLabel' => $this->variant_label,
            'unitPricePesewas' => $this->unit_price_pesewas,
            'quantity' => $this->quantity,
            'lineTotalPesewas' => $this->line_total_pesewas,
            'imageUrl' => $this->variant?->product?->image_url,
        ];
    }
}
