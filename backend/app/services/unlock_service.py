from datetime import UTC, datetime, timedelta
import re

from jose import JWTError, jwt

from app.core.config import get_settings


def build_unlock_cookie_name(article_hash: str) -> str:
    safe_hash = re.sub(r"[^a-zA-Z0-9_-]", "_", article_hash)
    return f"karticle_unlock_{safe_hash}"


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


def build_unlock_cookie_value(*, payment_id: str, article_id: str, publisher_id: str, article_hash: str) -> str:
    token = create_unlock_token(payment_id=payment_id, article_id=article_id, publisher_id=publisher_id)
    return f"{article_hash}.{token}"


def verify_unlock_cookie_value(cookie_value: str, article_id: str, article_hash: str) -> tuple[bool, str | None]:
    if "." not in cookie_value:
        return False, None

    cookie_article_hash, token = cookie_value.split(".", 1)
    if cookie_article_hash != article_hash:
        return False, None

    return verify_unlock_token(token, article_id)
