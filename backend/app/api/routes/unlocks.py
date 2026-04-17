from fastapi import APIRouter, Request

from app.schemas.unlocks import VerifyUnlockRequest, VerifyUnlockResponse
from app.services.payment_service import PAYMENTS, get_unlock_cookie_name
from app.services.unlock_service import verify_unlock_cookie_value, verify_unlock_token

router = APIRouter(prefix="/v1/unlocks", tags=["unlocks"])


@router.post("/verify", response_model=VerifyUnlockResponse)
def post_verify_unlock(payload: VerifyUnlockRequest, request: Request) -> VerifyUnlockResponse:
    cookie_name = get_unlock_cookie_name(payload.article_hash)
    cookie_value = payload.unlock_cookie_value or request.cookies.get(cookie_name)

    if cookie_value:
        is_unlocked, expires_at = verify_unlock_cookie_value(cookie_value, payload.article_id, payload.article_hash)
        return VerifyUnlockResponse(is_unlocked=is_unlocked, cookie_name=cookie_name, expires_at=expires_at)

    payment_record = None
    for record in PAYMENTS.values():
        if record.article_id == payload.article_id and record.article_hash == payload.article_hash:
            payment_record = record
            break

    if payment_record and payment_record.unlock_token:
        is_unlocked, expires_at = verify_unlock_token(payment_record.unlock_token, payload.article_id)
        return VerifyUnlockResponse(is_unlocked=is_unlocked, cookie_name=cookie_name, expires_at=expires_at)

    return VerifyUnlockResponse(is_unlocked=False, cookie_name=cookie_name, expires_at=None)
