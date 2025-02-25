import asyncio
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy.pool import NullPool
from alembic import context
from app.core.config import get_settings
from app.db.base import Base  # すべてのモデルが `Base` から派生していると仮定

# Alembic の設定ファイルをロード
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# メタデータを取得
target_metadata = Base.metadata

# 環境変数から非同期データベースURLを取得
settings = get_settings()
DATABASE_URL = settings.DATABASE_URL

# 非同期エンジンを作成
connectable = create_async_engine(DATABASE_URL, poolclass=NullPool)

async def run_migrations_online():
    """非同期でマイグレーションを実行"""
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

def do_run_migrations(sync_connection):
    """同期接続でマイグレーションを実行"""
    context.configure(
        connection=sync_connection,
        target_metadata=target_metadata
    )
    with context.begin_transaction():
        context.run_migrations()

if context.is_offline_mode():
    # オフラインモードでは `context.configure` に URL を直接設定
    context.configure(url=DATABASE_URL, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()
else:
    async def run_and_cleanup():
        await run_migrations_online()
        await connectable.dispose()
    asyncio.run(run_and_cleanup())

