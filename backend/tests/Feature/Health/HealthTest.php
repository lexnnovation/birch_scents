<?php

use Illuminate\Support\Facades\DB;

it('answers the liveness probe without opening a database connection', function () {
    // Coolify polls this on a timer forever. A database connection here is
    // billable Supabase egress that accrues with zero visitors on the site.
    $count = 0;
    DB::listen(function () use (&$count) {
        $count++;
    });

    $this->getJson('/api/v1/health')
        ->assertOk()
        ->assertJsonPath('data.status', 'ok')
        ->assertJsonPath('data.database', 'not_checked');

    expect($count)->toBe(0);
});

it('probes the database only when explicitly asked', function () {
    $this->getJson('/api/v1/health?deep=1')
        ->assertOk()
        ->assertJsonPath('data.status', 'ok')
        ->assertJsonPath('data.database', 'ok');
});

it('caches a successful deep probe so repeat checks skip the database', function () {
    $this->getJson('/api/v1/health?deep=1')->assertOk();

    $count = 0;
    DB::listen(function () use (&$count) {
        $count++;
    });

    $this->getJson('/api/v1/health?deep=1')->assertOk()->assertJsonPath('data.database', 'ok');

    expect($count)->toBe(0);
});
