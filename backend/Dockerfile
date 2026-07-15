# syntax=docker/dockerfile:1

FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist --optimize-autoloader

FROM php:8.4-fpm-alpine AS app
WORKDIR /var/www/html

RUN apk add --no-cache nginx postgresql-libs \
    && apk add --no-cache --virtual .build-deps postgresql-dev oniguruma-dev autoconf gcc g++ make \
    && docker-php-ext-install pdo_pgsql pgsql bcmath mbstring opcache \
    && apk del .build-deps

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY --from=vendor /app/vendor ./vendor
COPY . .

# Vendor was installed without app source present (composer.json/lock only,
# for cache-friendly layering) — regenerate the optimized classmap now that
# app/, database/factories/, database/seeders/ actually exist.
RUN composer dump-autoload --no-dev --optimize --classmap-authoritative

RUN mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
