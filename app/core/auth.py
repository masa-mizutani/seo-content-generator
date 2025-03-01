from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from app.core.config import settings
from app.crud import user as user_crud
from app.db.base import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # デバッグログを追加
        print(f"Decoding token: {token[:10]}...")
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            print("No 'sub' claim in token")
            raise credentials_exception
        print(f"Token contains email: {email}")
    except JWTError as e:
        print(f"JWT decode error: {str(e)}")
        raise credentials_exception
    
    # メールアドレスでユーザーを検索
    user = await user_crud.get_by_email(db, email=email)
    if user is None:
        print(f"User with email {email} not found")
        raise credentials_exception
    if not user.is_active:
        print(f"User {email} is inactive")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return user

def get_token_expiration(token: str) -> Optional[datetime]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        exp = payload.get("exp")
        if exp:
            return datetime.fromtimestamp(exp)
        return None
    except jwt.JWTError:
        return None
