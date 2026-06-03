FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    git curl zip unzip sqlite sqlite-dev oniguruma-dev libxml2-dev

RUN docker-php-ext-install \
    pdo pdo_sqlite mbstring exif pcntl bcmath

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY backend/ .

RUN mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN chown -R www-data:www-data storage bootstrap/cache

COPY docker/php/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["/entrypoint.sh"]
