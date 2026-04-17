from typing import Literal

from pydantic import BaseModel, Field


class CreatePaymentIntentRequest(BaseModel):
    publisher_id: str = Field(min_length=1)
    article_id: str = Field(min_length=1)
    amount_cents: int = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3)
    return_url: str | None = None


class CreatePaymentIntentResponse(BaseModel):
    payment_id: str
    checkout_url: str
    status: Literal["pending", "paid"]


class PaymentWebhookEvent(BaseModel):
    provider_event_id: str = Field(min_length=1)
    payment_id: str = Field(min_length=1)
    status: Literal["pending", "paid", "failed"]
    signature: str = Field(min_length=1)
