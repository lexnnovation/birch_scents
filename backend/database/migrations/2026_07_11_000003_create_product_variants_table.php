<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('label'); // '50ml' | '100ml' | 'Standard'
            $table->string('sku')->unique();
            $table->bigInteger('price_pesewas');
            $table->bigInteger('compare_at_pesewas')->nullable();
            $table->integer('stock')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('product_id');
        });

        // Stock can never go negative (CLAUDE.md §7 — enforced in code + DB).
        // Postgres only: SQLite (used by the Pest test suite) has no
        // `ALTER TABLE ADD CONSTRAINT`; app-level validation covers it there.
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE product_variants ADD CONSTRAINT product_variants_stock_non_negative CHECK (stock >= 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
