<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Users are identified by Supabase Auth (CLAUDE.md §6). Laravel stores no
 * passwords and runs no login routes — a local row is found-or-created from
 * the JWT `sub` claim. `is_admin` is set manually in the DB for MVP and is
 * the only source of admin authority (never derived from JWT/frontend).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->uuid('supabase_id')->unique();
            $table->string('email')->unique();
            $table->string('name')->nullable();
            $table->string('phone')->nullable();
            $table->boolean('is_admin')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
