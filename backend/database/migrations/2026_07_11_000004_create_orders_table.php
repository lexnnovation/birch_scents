<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // e.g. BS-2026-000123
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending'); // OrderStatus enum
            $table->bigInteger('subtotal_pesewas');
            $table->bigInteger('delivery_fee_pesewas');
            $table->bigInteger('total_pesewas');
            $table->string('delivery_name');
            $table->string('delivery_phone');
            $table->string('delivery_address');
            $table->string('delivery_city');
            $table->text('delivery_note')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
