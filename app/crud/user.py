from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

async def get_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def authenticate(db: AsyncSession, email: str, password: str) -> Optional[User]:
    user = await get_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

async def create(db: AsyncSession, obj_in: UserCreate) -> User:
    db_obj = User(
        email=obj_in.email,
        hashed_password=get_password_hash(obj_in.password),
        company_name=obj_in.company_name,
        phone_number=obj_in.phone_number,
        is_active=obj_in.is_active,
        is_superuser=obj_in.is_superuser,
        subscription_plan=obj_in.subscription_plan
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def update(
    db: AsyncSession, db_obj: User, obj_in: UserUpdate
) -> User:
    update_data = obj_in.model_dump(exclude_unset=True)
    if update_data.get("password"):
        hashed_password = get_password_hash(update_data["password"])
        del update_data["password"]
        update_data["hashed_password"] = hashed_password
    
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
