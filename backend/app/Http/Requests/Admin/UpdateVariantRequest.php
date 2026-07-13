<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $variant = $this->route('variant');

        return [
            'label' => ['sometimes', 'string', 'in:30ml,100ml,150ml,500ml,Standard'],
            'sku' => ['sometimes', 'string', 'max:255', Rule::unique('product_variants', 'sku')->ignore($variant)],
            'pricePesewas' => ['sometimes', 'integer', 'min:0'],
            'compareAtPesewas' => ['nullable', 'integer', 'min:0'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }

    public function toModelAttributes(): array
    {
        $map = [
            'label' => 'label',
            'sku' => 'sku',
            'pricePesewas' => 'price_pesewas',
            'compareAtPesewas' => 'compare_at_pesewas',
            'stock' => 'stock',
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
