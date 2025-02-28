echo "=== Environment Variables Dump ==="
env
echo "=================================="


#!/bin/bash
set -e

echo "DATABASE_URL is: $DATABASE_URL"
echo "Starting application initialization..."
echo "PORT is: $PORT"

# データベースの準備ができるまで待機
MAX_RETRIES=30
RETRY_INTERVAL=2

wait_for_postgres() {
    local retries=0
    while [ $retries -lt $MAX_RETRIES ]; do
        echo "Attempting to connect to PostgreSQL (attempt $((retries + 1))/$MAX_RETRIES)..."
        if python -c "
import sys
from sqlalchemy import create_engine, text
from app.core.config import get_settings
settings = get_settings()
engine = create_engine(settings.DATABASE_URL.replace('+asyncpg', ''))
try:
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        sys.exit(0)
except Exception as e:
    print(f'Database connection failed: {e}')
    sys.exit(1)
"; then
            echo "Successfully connected to PostgreSQL"
            return 0
        fi
        retries=$((retries + 1))
        echo "Connection failed. Waiting $RETRY_INTERVAL seconds before retry..."
        sleep $RETRY_INTERVAL
    done
    echo "Failed to connect to PostgreSQL after $MAX_RETRIES attempts"
    return 1
}

# データベースの準備を待機
#echo "Waiting for PostgreSQL to be ready..."
#if ! wait_for_postgres; then
#    echo "PostgreSQL is not available. Exiting."
#    exit 1
#fi

# データベースマイグレーションの実行を試みる
echo "Running database migrations..."
# alembic upgrade head

# マイグレーションが成功した場合、アプリケーションを起動
echo "=== Application Initialization Complete ==="
echo "=== Starting Application Server on Port: $PORT ==="
echo "=== $(date) ==="
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --log-level debug --timeout-keep-alive 75

