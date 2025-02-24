from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional, List
from .security import generate_secret_key
import os


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
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/app")

    # 非同期データベース接続用のURL
    @property
    def async_database_url(self) -> str:
        """非同期接続用のURLを生成"""
        return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

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
def get_settings():
    return Settings()
