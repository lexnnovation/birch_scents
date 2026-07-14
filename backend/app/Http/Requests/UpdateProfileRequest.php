<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Neither `name` nor `email` are here — both are Supabase-managed, synced
 * on every request by VerifySupabaseJwt (which always prefers the JWT's
 * claim over whatever's stored locally), so accepting a `name` write here
 * would just get silently overwritten on the user's very next request.
 */
class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'city' => ['sometimes', 'nullable', 'string', 'max:120'],
        ];
    }
}
