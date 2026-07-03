#!/bin/sh
set -e

# SQLite DBが存在しない場合は作成
mkdir -p /var/www/html/database/state
touch /var/www/html/database/state/database.sqlite
chown -R www-data:www-data /var/www/html/database/state

# マイグレーション実行
php /var/www/html/artisan migrate --force

exec php-fpm
