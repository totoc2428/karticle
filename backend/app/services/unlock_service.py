from datetime import UTC, datetime, timedelta

from jose import JWTError, jwt

from app.core.config import get_settings


def create_unlock_token(*, payment_id: str, article_id: str, publisher_id: str) -> str:
    settings = get_settings()
    expires_at = datetime.now(tz=UTC) + timedelta(days=settings.unlock_token_ttl_days)
    claims = {
        "sub": payment_id,
        "article_id": article_id,
        "publisher_id": publisher_id,
        "exp": int(expires_at.timestamp())
    }
    return jwt.encode(claims, settings.unlock_token_secret, algorithm="HS256")


def verify_unlock_token(unlock_token: str, article_id: str) -> tuple[bool, str | None]:
    settings = get_settings()
    try:
        payload = jwt.decode(unlock_token, settings.unlock_token_secret, algorithms=["HS256"])
    except JWTError:
        return False, None

    if payload.get("article_id") != article_id:
        return False, None

    exp = payload.get("exp")
    if exp is None:
        return False, None

    expires_at = datetime.fromtimestamp(exp, tz=UTC).isoformat()
    return True, expires_at
