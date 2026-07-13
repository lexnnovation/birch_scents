<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'in:30ml,100ml,150ml,500ml,Standard'],
            'sku' => ['required', 'string', 'max:255', 'unique:product_variants,sku'],
            'pricePesewas' => ['required', 'integer', 'min:0'],
            'compareAtPesewas' => ['nullable', 'integer', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }

    public function toModelAttributes(): array
    {
        $data = $this->validated();

        return [
            'label' => $data['label'],
            'sku' => $data['sku'],
            'price_pesewas' => $data['pricePesewas'],
            'compare_at_pesewas' => $data['compareAtPesewas'] ?? null,
            'stock' => $data['stock'],
            'is_active' => $data['isActive'] ?? true,
        ];
    }
}
