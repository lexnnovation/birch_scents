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

];
