from fastapi import APIRouter

from app.schemas.unlocks import VerifyUnlockRequest, VerifyUnlockResponse
from app.services.unlock_service import verify_unlock_token

router = APIRouter(prefix="/v1/unlocks", tags=["unlocks"])


@router.post("/verify", response_model=VerifyUnlockResponse)
def post_verify_unlock(payload: VerifyUnlockRequest) -> VerifyUnlockResponse:
    is_unlocked, expires_at = verify_unlock_token(payload.unlock_token, payload.article_id)
    return VerifyUnlockResponse(is_unlocked=is_unlocked, expires_at=expires_at)
