<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Order */
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'orderNumber' => $this->order_number,
            'status' => $this->status->value,
            'subtotalPesewas' => $this->subtotal_pesewas,
            'deliveryFeePesewas' => $this->delivery_fee_pesewas,
            'totalPesewas' => $this->total_pesewas,
            'delivery' => [
                'name' => $this->delivery_name,
                'phone' => $this->delivery_phone,
                'address' => $this->delivery_address,
                'city' => $this->delivery_city,
                'note' => $this->delivery_note,
            ],
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'createdAt' => $this->created_at->toIso8601String(),
        ];
    }
}
