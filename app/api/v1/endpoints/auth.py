from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import create_access_token
from app.db.base import get_db
from typing import Any

router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

@router.post("/login")
async def login(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # TODO: ユーザー認証の実装
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Incorrect email or password"
    )

@router.post("/signup")
async def create_user(
    # TODO: ユーザー作成スキーマの実装
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Create new user
    """
    # TODO: ユーザー作成の実装
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Not implemented"
    )
