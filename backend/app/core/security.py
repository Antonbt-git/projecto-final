import secrets
from datetime import datetime, timedelta, timezone

from jose import jwt
from pwdlib import PasswordHash

from fastapi import HTTPException, status
from jose import JWTError, jwt


password_hash = PasswordHash.recommended()

SECRET_KEY = "WildCountry1967London110304"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
CODIGO_2FA_EXPIRE_MINUTES = 10


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
) -> str:
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def generar_codigo_2fa() -> str:
    """Genera un código numérico de 6 dígitos usando un generador seguro."""

    return f"{secrets.randbelow(1_000_000):06d}"


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        return payload

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )

