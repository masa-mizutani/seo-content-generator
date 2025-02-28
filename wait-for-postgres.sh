#!/bin/sh
# wait-for-postgres.sh

set -e

echo "Checking PostgreSQL connection..."
echo "Database URL: $DATABASE_URL"

# DATABASE_URLからホスト、ポート、データベース名、ユーザー名を抽出
db_url=$(echo $DATABASE_URL | sed 's|postgres://||')
db_user=$(echo $db_url | cut -d':' -f1)
db_pass=$(echo $db_url | cut -d':' -f2 | cut -d'@' -f1)
db_host=$(echo $db_url | cut -d'@' -f2 | cut -d':' -f1)
db_port=$(echo $db_url | cut -d':' -f3 | cut -d'/' -f1)
db_name=$(echo $db_url | cut -d'/' -f2)

echo "Connecting to PostgreSQL at $db_host:$db_port..."

until PGPASSWORD=$db_pass psql -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
