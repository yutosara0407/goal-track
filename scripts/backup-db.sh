#!/usr/bin/env bash
#
# GoalTrack SQLite DBのバックアップスクリプト
# 稼働中のDBから安全にスナップショット（VACUUM INTO）を取り、gzipで保存する。
# 使い方: ./scripts/backup-db.sh [バックアップ先ディレクトリ]
# cron例（毎日4時、14日分保持）:
#   0 4 * * * /home/ubuntu/goal-track/scripts/backup-db.sh >> /home/ubuntu/goal-track-backups/backup.log 2>&1
#
set -euo pipefail

BACKUP_DIR="${1:-$HOME/goal-track-backups}"
KEEP_DAYS=14
CONTAINER=goal-track-backend-1
STAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

# VACUUM INTO は稼働中でも一貫性のあるスナップショットを作れる（SQLite 3.27+）
docker exec "$CONTAINER" php -r '
@unlink("/tmp/db-backup.sqlite");
$db = new PDO("sqlite:/var/www/html/database/state/database.sqlite");
$db->exec("VACUUM INTO '\''/tmp/db-backup.sqlite'\''");
'

docker cp "$CONTAINER:/tmp/db-backup.sqlite" "$BACKUP_DIR/database-$STAMP.sqlite"
docker exec "$CONTAINER" rm -f /tmp/db-backup.sqlite
gzip "$BACKUP_DIR/database-$STAMP.sqlite"

# 保持期間を過ぎた古いバックアップを削除
find "$BACKUP_DIR" -name 'database-*.sqlite.gz' -mtime +"$KEEP_DAYS" -delete

echo "$(date '+%Y-%m-%d %H:%M:%S') backup OK: $BACKUP_DIR/database-$STAMP.sqlite.gz"
