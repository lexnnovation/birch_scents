<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * Liveness + database connectivity probe (CLAUDE.md §13). Coolify hits this
 * for health checks; a failing DB ping returns 503 so the orchestrator knows.
 */
class HealthController
{
    public function __invoke(): JsonResponse
    {
        $database = 'ok';
        $status = 200;

        try {
            DB::connection()->getPdo();
            DB::select('select 1');
        } catch (\Throwable $e) {
            $database = 'unavailable';
            $status = 503;
        }

        return response()->json([
            'data' => [
                'status' => $status === 200 ? 'ok' : 'degraded',
                'database' => $database,
                'time' => now()->toIso8601String(),
            ],
        ], $status);
    }
}
