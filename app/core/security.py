from datetime import datetime, timedelta
from typing import Any, Union, TYPE_CHECKING
import secrets
import string
from jose import jwt
from passlib.context import CryptContext

if TYPE_CHECKING:
    from app.core.config import Settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"

def generate_secret_key(length: int = 64) -> str:
    """
    ランダムな文字列を生成してシークレットキーとして使用
    """
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    # 関数内でsettingsをインポート
    from app.core.config import get_settings
    settings = get_settings()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
