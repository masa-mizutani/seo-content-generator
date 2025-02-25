from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
import logging
from contextlib import asynccontextmanager
from app.db.session import AsyncSessionLocal
from sqlalchemy import text  # 追加

# ロギングの設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """アプリケーションの起動時と終了時の処理"""
    logger.info("Starting up application...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info("Testing database connection...")

    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1"))
            _ = result.scalar()  # await 削除。同期的に結果を取得
            logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        raise

    yield

    logger.info("Shutting down application...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番では適切なオリジンに制限する
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# APIルーターのインポートと登録
from app.api.v1 import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Welcome to SEO Content Generator API",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }
