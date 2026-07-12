<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Order> */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subtotal = $this->faker->numberBetween(5000, 50000);
        $deliveryFee = 2000;

        return [
            'order_number' => 'BS-'.now()->year.'-'.$this->faker->unique()->numerify('######'),
            'user_id' => User::factory(),
            'status' => OrderStatus::Pending,
            'subtotal_pesewas' => $subtotal,
            'delivery_fee_pesewas' => $deliveryFee,
            'total_pesewas' => $subtotal + $deliveryFee,
            'delivery_name' => $this->faker->name(),
            'delivery_phone' => $this->faker->phoneNumber(),
            'delivery_address' => $this->faker->streetAddress(),
            'delivery_city' => $this->faker->city(),
            'delivery_note' => null,
        ];
    }
}
