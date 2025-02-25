from logging.config import fileConfig
import asyncio
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
from app.core.config import get_settings
from app.db.base import Base

# Alembicの設定オブジェクト
config = context.config

# 非同期用のデータベースURLを取得して設定を上書き
settings = get_settings()
config.set_main_option("sqlalchemy.url", settings.async_database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ターゲットとなるメタデータ（全モデル情報）
target_metadata = Base.metadata

def do_run_migrations(connection):
    """同期的にマイグレーションを実行する関数"""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_offline():
    """オフラインモードでのマイグレーションを実行"""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """オンラインモードでのマイグレーションを実行"""
    connectable = create_async_engine(
        config.get_main_option("sqlalchemy.url"),
        poolclass=pool.NullPool,
    )

    async def do_run():
        async with connectable.connect() as connection:
            await connection.run_sync(do_run_migrations)

    asyncio.run(do_run())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
