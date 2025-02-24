from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.config import get_settings
import logging
import os

router = APIRouter()
settings = get_settings()
logger = logging.getLogger(__name__)

@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    アプリケーションのヘルスチェックエンドポイント。
    データベース接続を確認し、アプリケーションの状態を返します。
    """
    logger.debug("Health check requested")
    try:
        # データベース接続のテスト
        logger.debug("Testing database connection...")
        result = await db.execute("SELECT 1")
        await result.scalar()
        logger.debug("Database connection successful")

        response = {
            "status": "healthy",
            "database": "connected",
            "environment": settings.ENVIRONMENT,
            "version": settings.VERSION
        }
        logger.debug(f"Health check response: {response}")
        return response

    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unhealthy",
                "error": str(e),
                "database": "disconnected",
                "database_url": settings.DATABASE_URL.split("@")[1] if "@" in settings.DATABASE_URL else "URL format error",
                "env_vars": {k: v for k, v in os.environ.items() if k.startswith(("POSTGRES", "DATABASE"))}
            }
        )

@router.get("/health/config", include_in_schema=False)
async def health_check_config():
    """
    設定情報のデバッグエンドポイント。
    本番環境では無効化されます。
    """
    if not settings.DEBUG:
        raise HTTPException(status_code=404, detail="Not found")
    
    return {
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG,
        "database_host": settings.DATABASE_URL.split("@")[1].split("/")[0] if "@" in settings.DATABASE_URL else "URL format error",
        "env_vars_exist": {
            "DATABASE_URL": "DATABASE_URL" in os.environ,
            "POSTGRES_URL": "POSTGRES_URL" in os.environ,
        }
    }
