from pydantic import BaseModel, Field


class VerifyUnlockRequest(BaseModel):
    article_hash: str = Field(min_length=1)
    article_id: str = Field(min_length=1)
    unlock_cookie_value: str | None = None


class VerifyUnlockResponse(BaseModel):
    is_unlocked: bool
    cookie_name: str
    expires_at: str | None = None
