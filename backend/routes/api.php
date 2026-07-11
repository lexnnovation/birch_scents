<?php

use App\Http\Controllers\Api\V1\HealthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 routes
|--------------------------------------------------------------------------
| Registered in bootstrap/app.php with the "api/v1" prefix. All customer,
| auth, and admin endpoints live here (added in Phases 7–9). Nothing here
| uses Laravel sessions — auth is stateless via the Supabase JWT middleware.
*/

Route::get('health', HealthController::class)->name('health');
