<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Liveness probe (CLAUDE.md §13). Coolify polls this continuously.
 *
 * The default response deliberately does NOT touch the database. Every
 * Postgres connection opened through Supabase's pooler costs a TLS handshake
 * and auth round-trip of billable egress, and a probe on a timer accrues that
 * 24/7 whether or not a single visitor is on the site — which made an idle
 * deployment the largest consumer of the egress quota.
 *
 * Gating container health on database reachability is also wrong on its own
 * terms: restarting this container cannot fix a database outage, it only adds
 * a restart loop on top of one. Liveness answers "is the app process up".
 *
 * Pass ?deep=1 for a real connectivity probe (still 503 on failure) when you
 * want to check the database path explicitly.
 */
class HealthController
{
    /** Seconds a successful database probe is trusted for. */
    private const PROBE_TTL = 60;

    private const PROBE_KEY = 'health:database';

    public function __invoke(Request $request): JsonResponse
    {
        if (! $request->boolean('deep')) {
            return response()->json([
                'data' => [
                    'status' => 'ok',
                    'database' => 'not_checked',
                    'time' => now()->toIso8601String(),
                ],
            ]);
        }

        $healthy = $this->probeDatabase();

        return response()->json([
            'data' => [
                'status' => $healthy ? 'ok' : 'degraded',
                'database' => $healthy ? 'ok' : 'unavailable',
                'time' => now()->toIso8601String(),
            ],
        ], $healthy ? 200 : 503);
    }

    /**
     * Only successes are cached. A failure always re-probes on the next call,
     * so recovery is reported immediately rather than after the TTL expires.
     */
    private function probeDatabase(): bool
    {
        if (Cache::get(self::PROBE_KEY) === true) {
            return true;
        }

        try {
            DB::connection()->getPdo();
            DB::select('select 1');
        } catch (\Throwable) {
            return false;
        }

        Cache::put(self::PROBE_KEY, true, self::PROBE_TTL);

        return true;
    }
}
