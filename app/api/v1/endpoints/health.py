from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()

@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        # データベース接続のテスト
        result = await db.execute("SELECT 1")
        await result.scalar()

        return {
            "status": "healthy",
            "database": "connected",
            "environment": settings.ENVIRONMENT,
            "version": settings.VERSION
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unhealthy",
                "error": str(e),
                "database": "disconnected"
            }
        )
