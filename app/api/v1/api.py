from fastapi import APIRouter
from app.api.v1.endpoints import scraping, content, auth

api_router = APIRouter()

# 各エンドポイントルーターの登録
api_router.include_router(auth.router, prefix="/auth", tags=["認証"])
api_router.include_router(scraping.router, prefix="/scraping", tags=["スクレイピング"])
# analysis は未実装のため登録しません
api_router.include_router(content.router, prefix="/content", tags=["コンテンツ生成"])

# ヘルスチェック用エンドポイントの追加
@api_router.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
