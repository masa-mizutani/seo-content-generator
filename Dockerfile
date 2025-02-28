FROM python:3.11-slim as builder

WORKDIR /app

# システムの依存関係をインストール（ビルド用）
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 仮想環境を作成
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Python依存関係をインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 実行用の軽量イメージ
FROM python:3.11-slim

WORKDIR /app

# 実行時に必要な最小限のシステム依存関係をインストール（postgresql-client を追加）
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# 仮想環境をコピー
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 環境変数の設定
ENV PORT=8000
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# アプリケーションコードをコピー
COPY . .

# スタートアップスクリプトの準備
RUN chmod +x start.sh wait-for-postgres.sh

# ヘルスチェック設定（開始待機期間を60秒に延長）
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:$PORT/api/v1/health || exit 1

# スタートアップスクリプトを実行
CMD ["./start.sh"]
