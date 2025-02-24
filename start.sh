#!/bin/bash
set -e

echo "Starting application initialization..."

# データベースマイグレーションの実行を試みる
echo "Running database migrations..."
alembic upgrade head

# マイグレーションが成功した場合、アプリケーションを起動
echo "Starting application server..."
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --log-level info
