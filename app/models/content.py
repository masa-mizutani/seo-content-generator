from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    keyword = Column(String, nullable=False)
    title = Column(String)
    meta_description = Column(String)
    content = Column(Text)
    headings = Column(JSON)  # H1-H6の見出し構造
    analysis_results = Column(JSON)  # キーワード分析結果
    scraping_results = Column(JSON)  # スクレイピング結果のサマリー
    wordpress_post_id = Column(Integer)  # WordPressに投稿された場合のID
    status = Column(String)  # draft, published, error
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # リレーションシップ
    user = relationship("User", back_populates="contents")
