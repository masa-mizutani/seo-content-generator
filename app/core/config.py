from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional, List


class Settings(BaseSettings):
    # アプリケーション設定
    PROJECT_NAME: str = "SEO Content Generator"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # データベース設定
    DATABASE_URL: str

    # OpenAI設定
    OPENAI_API_KEY: str

    # Square API設定
    SQUARE_ACCESS_TOKEN: str
    SQUARE_ENVIRONMENT: str = "sandbox"

    # WordPress設定
    WP_API_URL: Optional[str] = None
    WP_USERNAME: Optional[str] = None
    WP_APP_PASSWORD: Optional[str] = None

    # Google OAuth設定
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # スクレイピング設定
    MAX_SCRAPE_PAGES: int = 5
    SCRAPE_DELAY: int = 5
    BLOCKED_DOMAINS: List[str] = [
        "amazon.com",
        "amazon.co.jp",
        "rakuten.co.jp",
        "yahoo.co.jp",
        "ebay.com",
        "x.com",
        "cosme.net",
        "lipscosme.com",
        "tiktok.com",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
