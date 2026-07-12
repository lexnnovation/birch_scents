<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Delivery fee
    |--------------------------------------------------------------------------
    |
    | Flat nationwide delivery fee in pesewas (CLAUDE.md §8 — integers only).
    | GH₵ 20.00 by default.
    |
    */

    'delivery_fee_pesewas' => (int) env('CHECKOUT_DELIVERY_FEE_PESEWAS', 2000),

    /*
    |--------------------------------------------------------------------------
    | Paystack callback base
    |--------------------------------------------------------------------------
    |
    | The storefront URL Paystack redirects the customer back to after
    | checkout (CLAUDE.md §9) — never marks anything paid, just a UX bounce.
    |
    */

    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),

];
