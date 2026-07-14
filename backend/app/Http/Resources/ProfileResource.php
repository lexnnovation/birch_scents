<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The self-service profile shape for GET/PATCH /me — deliberately excludes
 * isAdmin/supabaseId, which are never editable by the user themselves.
 *
 * @mixin \App\Models\User
 */
class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'city' => $this->city,
        ];
    }
}
