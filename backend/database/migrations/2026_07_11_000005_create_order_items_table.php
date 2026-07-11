<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Order items snapshot the product name and price at purchase time so later
 * product/variant edits never rewrite order history (CLAUDE.md §7). The
 * variant FK is nullable + nulls-on-delete: history survives even if the
 * variant is later removed.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->string('variant_label');
            $table->bigInteger('unit_price_pesewas');
            $table->unsignedInteger('quantity');
            $table->bigInteger('line_total_pesewas');
            $table->timestamps();

            $table->index('order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
