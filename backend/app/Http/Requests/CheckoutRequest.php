<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authentication is enforced by the auth.supabase route middleware.
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.variantId' => ['required', 'string', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'delivery' => ['required', 'array'],
            'delivery.name' => ['required', 'string', 'max:255'],
            'delivery.phone' => ['required', 'string', 'max:30'],
            'delivery.address' => ['required', 'string', 'max:500'],
            'delivery.city' => ['required', 'string', 'max:120'],
            'delivery.note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
