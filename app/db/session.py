from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# 非同期エンジンの作成
try:
    logger.info("Creating database engine...")
    engine = create_async_engine(
        settings.async_database_url,
        poolclass=NullPool,  # コネクションプールを無効化
        connect_args={
            "server_settings": {
                "application_name": "seo_content_generator",
            },
            "command_timeout": 60,  # コマンドタイムアウトを60秒に設定
        },
        echo=settings.DEBUG,  # SQLログを出力（デバッグモード時のみ）
    )
    logger.info("Database engine created successfully")
except Exception as e:
    logger.error(f"Failed to create database engine: {str(e)}")
    raise

# 非同期セッションの設定
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db() -> AsyncSession:
    """
    リクエストごとにデータベースセッションを提供する依存関係
    """
    async with AsyncSessionLocal() as session:
        try:
            logger.debug("Creating new database session")
            yield session
        except Exception as e:
            logger.error(f"Database session error: {str(e)}")
            raise
        finally:
            logger.debug("Closing database session")
            await session.close()
