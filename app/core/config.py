from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional, List
from .security import generate_secret_key
import os
import logging

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
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/seo_content"

    @property
    def async_database_url(self) -> str:
        """非同期接続用のURLを生成"""
        # Railway.appの環境変数を優先
        url = os.getenv("DATABASE_URL", self.DATABASE_URL)
        logger.debug(f"Original DATABASE_URL: {url}")
        
        # postgres:// を postgresql:// に変換
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        
        # 非同期ドライバを追加
        if not url.startswith("postgresql+asyncpg://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        
        logger.debug(f"Async DATABASE_URL: {url}")
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
    
    # 環境変数の存在を確認
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        logger.info("Using DATABASE_URL from environment variables")
    else:
        logger.warning("DATABASE_URL not found in environment variables, using default")
    
    return settings
