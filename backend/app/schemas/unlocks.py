from pydantic import BaseModel, Field


class VerifyUnlockRequest(BaseModel):
    unlock_token: str = Field(min_length=1)
    article_id: str = Field(min_length=1)


class VerifyUnlockResponse(BaseModel):
    is_unlocked: bool
    expires_at: str | None = None
