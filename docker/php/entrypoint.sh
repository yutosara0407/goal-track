#!/bin/sh
set -e

# SQLite DBが存在しない場合は作成
touch /var/www/html/database/database.sqlite
chown www-data:www-data /var/www/html/database/database.sqlite

# マイグレーション実行
php /var/www/html/artisan migrate --force

exec php-fpm
