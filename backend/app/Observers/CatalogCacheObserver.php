<?php

namespace App\Observers;

use App\Services\CatalogCache;

/**
 * Any write to catalog data drops the materialised snapshot, so the next
 * public read rebuilds it.
 *
 * This hangs off model events rather than calling CatalogCache::flush() from
 * each controller action deliberately: it means no write path can forget to
 * invalidate. That includes the ones that aren't obviously "catalog edits" —
 * notably the Paystack webhook decrementing variant stock after a successful
 * payment, since stock ships inside the cached product payload.
 *
 * Caveat: query-builder bulk writes (Model::query()->update(...)) bypass model
 * events. The app has none against catalog tables today; if one is ever added,
 * call CatalogCache::flush() alongside it.
 */
class CatalogCacheObserver
{
    public function __construct(private readonly CatalogCache $catalog) {}

    public function saved(): void
    {
        $this->catalog->flush();
    }

    public function deleted(): void
    {
        $this->catalog->flush();
    }
}
