<?php

namespace Database\Factories;

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Payment> */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'provider' => 'paystack',
            'reference' => 'bs_'.Str::random(24),
            'status' => PaymentStatus::Pending,
            'amount_pesewas' => $this->faker->numberBetween(5000, 50000),
            'currency' => 'GHS',
            'paid_at' => null,
            'raw_payload' => null,
        ];
    }
}
