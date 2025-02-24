from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional, List
from .security import generate_secret_key
import os
import logging
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    # アプリケーション設定
    PROJECT_NAME: str = "SEO Content Generator"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = generate_secret_key()  # 環境変数がない場合、ランダムに生成
    ENVIRONMENT: str = "production"  # デフォルトを本番環境に変更
    DEBUG: bool = False  # デフォルトをFalseに変更

    # OpenAI API設定
    OPENAI_API_KEY: str

    # データベース設定
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@db:5432/railway"  # Docker Compose用のデフォルト値
    )

    @property
    def async_database_url(self) -> str:
        """非同期接続用のURLを生成"""
        url = self.DATABASE_URL
        
        # URLの解析
        parsed = urlparse(url)
        logger.info(f"Database connection details:")
        logger.info(f"- Host: {parsed.hostname}")
        logger.info(f"- Port: {parsed.port}")
        logger.info(f"- Database: {parsed.path[1:] if parsed.path else 'default'}")
        logger.info(f"- Username: {parsed.username}")
        
        # postgres:// を postgresql:// に変換
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
            logger.debug("Converted postgres:// to postgresql://")
        
        # 非同期ドライバを追加
        if not url.startswith("postgresql+asyncpg://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            logger.debug("Added asyncpg driver")
        
        # 安全なURL（パスワードを隠蔽）を生成してログ出力
        safe_url = f"{parsed.scheme}://{parsed.username}:****@{parsed.hostname}:{parsed.port}{parsed.path}"
        logger.info(f"Using database URL: {safe_url}")
        
        return url

    # WordPress API設定（オプション）
    WP_API_URL: Optional[str] = None
    WP_USERNAME: Optional[str] = None
    WP_APP_PASSWORD: Optional[str] = None

    # スクレイピング設定
    MAX_SCRAPE_PAGES: int = 5
    SCRAPE_DELAY: int = 5

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    logger.info(f"Loading settings for environment: {settings.ENVIRONMENT}")
    
    # データベースURLの存在確認
    if "DATABASE_URL" in os.environ:
        logger.info("Using DATABASE_URL from environment variables")
    else:
        logger.warning("DATABASE_URL not found in environment variables, using default Docker Compose configuration")
    
    return settings
