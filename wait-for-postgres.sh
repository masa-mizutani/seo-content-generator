#!/bin/sh
# wait-for-postgres.sh

set -e

echo "Checking PostgreSQL connection..."
echo "Database URL: $DATABASE_URL"

# データベース接続の確認（最大30回試行）
max_attempts=30
count=0

until psql "$DATABASE_URL" -c '\q' 2>/dev/null || [ $count -eq $max_attempts ]; do
  count=$((count + 1))
  >&2 echo "Postgres is unavailable - sleeping (attempt $count/$max_attempts)"
  sleep 2
done

if [ $count -eq $max_attempts ]; then
  >&2 echo "Failed to connect to Postgres after $max_attempts attempts"
  exit 1
fi

>&2 echo "Postgres is up - executing command"
