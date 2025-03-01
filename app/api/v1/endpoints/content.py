from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from typing import Dict, Any, List
import openai
from app.core.config import get_settings
from pydantic import BaseModel

router = APIRouter()
settings = get_settings()

class AnalysisRequest(BaseModel):
    analysis_results: Dict[str, Any]

@router.get("/", response_model=List[Dict[str, Any]])
async def get_contents(db: AsyncSession = Depends(get_db)):
    """
    生成済みコンテンツの一覧を取得します
    """
    try:
        # ここではダミーデータを返します
        # 実際のアプリケーションではデータベースからデータを取得する処理を実装します
        return [
            {
                "id": 1,
                "keyword": "SEO対策",
                "title": "2023年最新のSEO対策ガイド",
                "content": "# 2023年最新のSEO対策ガイド\n\n## はじめに\nSEO対策は常に変化しています...",
                "created_at": "2023-01-01T00:00:00",
                "user_id": 1,
                "status": "draft"
            }
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate", response_model=Dict[str, Any])
async def generate_content(
    keyword: str = Query(..., description="検索キーワード"),
    request: AnalysisRequest = None,
    db: AsyncSession = Depends(get_db)
):
    """
    分析結果を基にAIで記事を生成します
    """
    try:
        # リクエストボディが空の場合はデフォルト値を設定
        analysis_results = {}
        if request and hasattr(request, 'analysis_results'):
            analysis_results = request.analysis_results
        
        # OpenAI APIを使用して記事を生成
        completion = await openai.ChatCompletion.acreate(
            model="gpt-40",
            messages=[
                {"role": "system", "content": """
あなたはSEOと文章作成の専門家です。提供されたスクレイピング情報（5つの記事）を分析し、
分析結果を元に同キーワードで上位表示（1位取得を目標）できるようSEOに最適化された記事を生成してください。

分析すべきポイント：
1. 1位・2位記事と3〜5位記事の違い
2. タイトル・メタディスクリプション（文字数、含まれるキーワード、訴求内容）
3. 見出しタグの構成、キーワード配置、情報の網羅性
4. 本文の文字数やキーワード出現数
5. E-E-A-T要素（筆者プロフィール、監修、引用元など）
6. 検索意図への合致度合い
7. 内部リンク・外部リンクの適切さ
8. 画像のaltテキストやメディア最適化
9. 上位表示のために特に重要と思われる要素
10. タイトル・ディスクリプションのクリック率向上策
11. 見出しタグの論理構成と段落整理
12. ユーザビリティ（箇条書きや表、FAQなど）
13. E-E-A-T補強策（専門性、権威性、信用性、経験の訴求）

出力は必ずMarkdown形式で行い、以下のセクションを含めてください：

# 比較分析結果
## 1位・2位記事 vs 3〜5位記事の相違点
- 主要な違い
- 重要な考察

# 上位表示のための施策とポイント
## 必須コンテンツ要素
- 検索意図を満たすために必要な情報
- E-E-A-T強化のポイント
- 技術的な最適化項目

# 最適化された記事案
## メタ情報
- タイトル案（H1）
- メタディスクリプション

## 記事構成
- 見出し構成（H2-H5）
- 各セクションの本文
- 画像配置案とalt属性
- FAQ（必要な場合）
- まとめ/結論
- CTA（行動喚起）
"""},
                {"role": "user", "content": f"""
以下のキーワードと分析結果を元に、上記のフォーマットで記事を生成してください：

キーワード: {keyword}
分析結果: {analysis_results}
"""}
            ]
        )
        
        return {
            "keyword": keyword,
            "generated_content": completion.choices[0].message.content,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
