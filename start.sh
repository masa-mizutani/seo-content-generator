#!/bin/sh
set -e

echo "Starting start.sh..."
echo "PORT is: $PORT"
echo "DATABASE_URL is: $DATABASE_URL"

# データベースの接続待機
chmod +x wait-for-postgres.sh
./wait-for-postgres.sh

# データベースマイグレーションの実行
alembic upgrade head

# アプリケーションの起動
uvicorn app.main:app --host 0.0.0.0 --port $PORT
