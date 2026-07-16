<?php

use App\Http\Controllers\Api\V1\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\V1\Admin\ProductVariantController as AdminProductVariantController;
use App\Http\Controllers\Api\V1\Admin\VariantController as AdminVariantController;
use App\Http\Controllers\Api\V1\CatalogController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PaystackWebhookController;
use App\Http\Controllers\Api\V1\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 routes
|--------------------------------------------------------------------------
| Registered in bootstrap/app.php with the "api/v1" prefix. Nothing here
| uses Laravel sessions — auth is stateless via the Supabase JWT middleware
| (CLAUDE.md §6). Money/stock are always re-validated server-side.
*/

Route::get('health', HealthController::class)->name('health');

// Paystack webhook — outside auth entirely (Paystack, not a browser, calls
// this), HMAC-verified inside the controller, rate-limited (CLAUDE.md §9).
Route::post('webhooks/paystack', [PaystackWebhookController::class, 'handle'])
    ->middleware('throttle:60,1');

// Public catalog — no auth required. Rate-limited since it's unauthenticated
// and publicly reachable (search in particular runs a query across 3 columns
// per request); same per-IP limit as the webhook route.
Route::middleware('throttle:60,1')->group(function () {
    Route::get('categories', [CatalogController::class, 'categories']);
    Route::get('products', [CatalogController::class, 'products']);
    Route::get('products/{product}', [CatalogController::class, 'show']);
});

// Customer routes — own data only.
Route::middleware('auth.supabase')->group(function () {
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{orderNumber}', [OrderController::class, 'show']);
    Route::post('checkout', [CheckoutController::class, 'store']);
    Route::get('me', [ProfileController::class, 'show']);
    Route::patch('me', [ProfileController::class, 'update']);
});

// Admin routes — full catalog visibility + writes. Prefix is deliberately
// not "admin" — a less guessable path for a route with no login form to
// brute-force in the first place (auth is Supabase, not Laravel).
Route::prefix('bo')->middleware(['auth.supabase', 'admin'])->group(function () {
    Route::get('products', [AdminProductController::class, 'index']);
    Route::post('products', [AdminProductController::class, 'store']);
    Route::patch('products/{product}', [AdminProductController::class, 'update']);
    Route::delete('products/{product}', [AdminProductController::class, 'destroy']);

    Route::post('products/{product}/variants', [AdminProductVariantController::class, 'store']);
    Route::patch('variants/{variant}', [AdminProductVariantController::class, 'update']);
    Route::delete('variants/{variant}', [AdminProductVariantController::class, 'destroy']);
    Route::patch('variants/{variant}/stock', [AdminVariantController::class, 'updateStock']);

    Route::get('orders', [AdminOrderController::class, 'index']);
    Route::patch('orders/{order}', [AdminOrderController::class, 'update']);
});
