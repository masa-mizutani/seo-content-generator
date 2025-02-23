from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.services.scraping import ScrapingService
from typing import List, Dict, Any

router = APIRouter()

@router.post("/search", response_model=Dict[str, Any])
async def search_and_scrape(keyword: str, db: AsyncSession = Depends(get_db)):
    """
    指定されたキーワードでGoogle検索を行い、上位の結果をスクレイピングします
    """
    try:
        async with ScrapingService() as scraping_service:
            # 検索結果のURLを取得
            urls = await scraping_service.get_search_results(keyword)
            if not urls:
                raise HTTPException(status_code=404, detail="検索結果が見つかりませんでした")
            
            # 各URLの内容をスクレイピング
            results = []
            for url in urls[:5]:  # 上位5件のみ処理
                result = await scraping_service.scrape_page(url)
                if result:
                    results.append(result)
            
            return {
                "keyword": keyword,
                "results": results,
                "total_results": len(results)
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
