from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import get_settings

settings = get_settings()

# 非同期エンジンの作成
engine = create_async_engine(
    settings.async_database_url,
    echo=settings.DEBUG,
    future=True,
    poolclass=NullPool,  # コネクションプールを無効化
    connect_args={
        "server_settings": {
            "application_name": "seo-content-generator"
        }
    }
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
