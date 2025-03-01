from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.v1.api import api_router
import logging
from contextlib import asynccontextmanager
from app.db.session import AsyncSessionLocal
from sqlalchemy import text
from fastapi import Response

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
            _ = result.scalar()
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
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# CORSミドルウェアを追加
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://seo-content-generator-frontend.onrender.com",
        "http://localhost:3000",
        "http://localhost:5173",
        "*"  # 開発中は全てのオリジンを許可
    ],
    allow_origin_regex=r"https://(.*\.)?onrender\.com",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    expose_headers=["Content-Type", "Content-Length"],
    max_age=600,  # プリフライトリクエストのキャッシュ時間（秒）
)

# OPTIONSリクエストに対して応答するミドルウェアを追加
@app.middleware("http")
async def options_middleware(request, call_next):
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin",
            "Access-Control-Max-Age": "86400",
        }
        return Response(status_code=200, headers=headers)
    return await call_next(request)

# ルートエンドポイントの設定
@app.get("/")
async def root():
    return {
        "message": "Welcome to SEO Content Generator API",
        "version": settings.VERSION,
        "docs_url": f"{settings.API_V1_STR}/docs",
    }

# ヘルスチェックエンドポイント（プレフィックスの前に配置）
@app.get("/api/v1/health")
async def health_check():
    logger.info("Health check endpoint was called")
    return {"status": "ok"}


# APIルーターの登録（プレフィックスを含む）
app.include_router(api_router, prefix=settings.API_V1_STR)
