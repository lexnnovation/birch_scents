<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One payment per checkout attempt, keyed by a unique Paystack `reference`.
 * The verified webhook payload is stored in `raw_payload` for audit
 * (CLAUDE.md §9). A payment only becomes `success` via the verified webhook.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('provider')->default('paystack');
            $table->string('reference')->unique();
            $table->string('status')->default('pending'); // PaymentStatus enum
            $table->bigInteger('amount_pesewas');
            $table->string('currency', 3)->default('GHS');
            $table->timestamp('paid_at')->nullable();
            $table->jsonb('raw_payload')->nullable();
            $table->timestamps();

            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
