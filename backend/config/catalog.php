<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Catalog snapshot lifetime (seconds)
    |--------------------------------------------------------------------------
    |
    | How long the materialised public-catalog snapshot lives before it is
    | rebuilt from Postgres. Catalog writes invalidate it immediately (see
    | App\Observers\CatalogCacheObserver), so this is only a safety net for
    | changes made outside the app — a seeder run, a manual SQL edit — and can
    | safely be long. Every second here is Supabase egress not spent.
    |
    */

    'cache_ttl' => (int) env('CATALOG_CACHE_TTL', 21600), // 6 hours

];
