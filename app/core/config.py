from pydantic_settings import BaseSettings
from functools import lru_cache
import os
import logging
from urllib.parse import urlparse
import secrets
from typing import Optional

logger = logging.getLogger(__name__)

def _get_secret_key() -> str:
    """
    環境変数 "SECRET_KEY" が設定されていればその値を返し、
    設定されていなければランダムなシークレットキーを生成して返します。
    """
    return os.environ.get("SECRET_KEY", secrets.token_urlsafe(32))

class Settings(BaseSettings):
    PROJECT_NAME: str = "SEO Content Generator"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = _get_secret_key()
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    OPENAI_API_KEY: str
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/railway")
    WP_API_URL: Optional[str] = None
    WP_USERNAME: Optional[str] = None
    WP_APP_PASSWORD: Optional[str] = None
    MAX_SCRAPE_PAGES: int = 5
    SCRAPE_DELAY: int = 5

    @property
    def async_database_url(self) -> str:
        """
        非同期接続用のURLを生成する。
        postgres:// を postgresql:// に変換し、さらに非同期用ドライバー asyncpg を追加する。
        """
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        if not url.startswith("postgresql+asyncpg://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

class Config:
    # ENVIRONMENT が production なら .env ファイルを読み込まない（None に設定）
    env_file = ".env" if os.getenv("ENVIRONMENT", "development") != "production" else None

@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    logger.info(f"Loading settings for environment: {settings.ENVIRONMENT}")
    if "DATABASE_URL" in os.environ:
        logger.info("Using DATABASE_URL from environment variables")
    else:
        logger.warning("DATABASE_URL not found in environment variables, using default Docker Compose configuration")
    logger.info(f"Database URL: {settings.DATABASE_URL}")
    return settings

    #コメント
