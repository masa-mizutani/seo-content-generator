# SEO Content Generator

AIを活用したSEOコンテンツ生成・投稿自動化システム

## 機能概要

- Google検索結果の自動スクレイピング
- 機械学習による重要キーワード分析
- AIによる記事自動生成
- WordPress自動投稿
- SEO最適化支援

## 技術スタック

### バックエンド
- Python 3.11+
- FastAPI
- SQLAlchemy
- OpenAI GPT-4
- MeCab
- Transformers (BERT)

### フロントエンド
- React
- TypeScript
- Material-UI

### データベース
- SQLite (開発)
- PostgreSQL (本番)

## セットアップ手順

1. 環境構築
```bash
# Python仮想環境の作成と有効化
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存パッケージのインストール
pip install -r requirements.txt
```

2. 環境変数の設定
`.env`ファイルを作成し、必要な環境変数を設定:
```
OPENAI_API_KEY=your_api_key
SECRET_KEY=your_secret_key
SQUARE_ACCESS_TOKEN=your_square_token
```

3. データベースのマイグレーション
```bash
alembic upgrade head
```

4. 開発サーバーの起動
```bash
uvicorn app.main:app --reload
```

## ディレクトリ構造

```
seo-content-generator/
├── app/
│   ├── api/            # APIエンドポイント
│   ├── core/           # 設定、依存関係
│   ├── db/             # データベース
│   ├── models/         # SQLAlchemyモデル
│   ├── schemas/        # Pydanticスキーマ
│   ├── services/       # ビジネスロジック
│   └── utils/          # ユーティリティ関数
├── alembic/            # DBマイグレーション
├── frontend/           # Reactフロントエンド
├── tests/              # テストコード
└── requirements.txt    # Pythonパッケージ
```

## ライセンス

このプロジェクトは非公開です。すべての権利は運営会社に帰属します。
