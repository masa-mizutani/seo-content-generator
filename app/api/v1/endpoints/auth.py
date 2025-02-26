from datetime import timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import create_access_token
from app.core.auth import get_current_user, get_token_expiration, oauth2_scheme
from app.crud import user as user_crud
from app.schemas.user import User, UserCreate
from app.db.base import get_db
from typing import Any, Dict

router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

@router.get("/me", response_model=User)
async def read_current_user(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get current user information
    """
    return current_user

@router.get("/status")
async def check_auth_status(
    token: str = Depends(oauth2_scheme)
) -> Dict[str, Any]:
    """
    Check authentication status and token expiration
    """
    expiration = get_token_expiration(token)
    return {
        "authenticated": True,
        "expires_at": expiration,
        "expires_in": (expiration - datetime.utcnow()).total_seconds() if expiration else None
    }

@router.post("/login")
async def login(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = await user_crud.authenticate(
        db=db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/signup", response_model=User)
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Create new user
    """
    user = await user_crud.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = await user_crud.create(db, obj_in=user_in)
    return user
