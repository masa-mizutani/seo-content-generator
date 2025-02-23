from fastapi import APIRouter
from app.api.v1.endpoints import scraping, analysis, content, auth, wordpress, gmb

api_router = APIRouter()

# 各エンドポイントルーターの登録
api_router.include_router(auth.router, prefix="/auth", tags=["認証"])
api_router.include_router(scraping.router, prefix="/scraping", tags=["スクレイピング"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["コンテンツ分析"])
api_router.include_router(content.router, prefix="/content", tags=["コンテンツ生成"])
api_router.include_router(wordpress.router, prefix="/wordpress", tags=["WordPress"])
api_router.include_router(gmb.router, prefix="/gmb", tags=["Google Business Profile"])
