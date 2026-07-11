<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'product_id',
    'label',
    'sku',
    'price_pesewas',
    'compare_at_pesewas',
    'stock',
    'is_active',
])]
class ProductVariant extends Model
{
    protected function casts(): array
    {
        return [
            'price_pesewas' => 'integer',
            'compare_at_pesewas' => 'integer',
            'stock' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
