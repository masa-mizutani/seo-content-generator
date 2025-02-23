from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class WordPressConfig(Base):
    __tablename__ = "wordpress_configs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    site_url = Column(String, nullable=False)
    api_url = Column(String, nullable=False)
    username = Column(String, nullable=False)
    app_password = Column(String, nullable=False)  # WordPress Application Password
    site_name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # リレーションシップ
    user = relationship("User", back_populates="wordpress_configs")
