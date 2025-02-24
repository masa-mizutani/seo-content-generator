from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.config import get_settings
import logging

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
                "database": "disconnected"
            }
        )
