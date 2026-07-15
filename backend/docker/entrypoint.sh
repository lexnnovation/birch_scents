#!/bin/sh
set -e

# Config/route caching only — migrations run as a separate Coolify deploy
# step (CLAUDE.md §13), never on container boot.
php artisan config:cache
php artisan route:cache

php-fpm -D
exec nginx -g "daemon off;"
