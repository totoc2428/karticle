from typing import Literal

from pydantic import BaseModel, Field


class ArticleContext(BaseModel):
    publisher_id: str = Field(min_length=1)
    article_id: str = Field(min_length=1)
    article_url: str = Field(min_length=1)
    article_hash: str = Field(min_length=1)
    amount_cents: int = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3)
    return_url: str | None = None


class StartPaymentRequest(ArticleContext):
    pass


class StartPaymentResponse(BaseModel):
    payment_id: str
    checkout_url: str
    spa_url: str | None = None
    status: Literal["pending", "paid"]


class CompletePaymentRequest(BaseModel):
    payment_id: str = Field(min_length=1)
    provider_event_id: str = Field(min_length=1)
    signature: str | None = None


class CompletePaymentResponse(BaseModel):
    processed: bool
    payment_id: str
    status: Literal["pending", "paid", "failed"]
    unlock_cookie_name: str | None = None
    unlock_expires_at: str | None = None
    unlock_token: str | None = None


class PaymentWebhookEvent(CompletePaymentRequest):
    pass


class PaymentStatusResponse(BaseModel):
    is_unlocked: bool
    cookie_name: str
    expires_at: str | None = None


class LegacyCreatePaymentIntentRequest(ArticleContext):
    pass


class LegacyCreatePaymentIntentResponse(StartPaymentResponse):
    pass
    provider_event_id: str = Field(min_length=1)
    payment_id: str = Field(min_length=1)
    status: Literal["pending", "paid", "failed"]
    signature: str = Field(min_length=1)
