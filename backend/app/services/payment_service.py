from dataclasses import dataclass
from hashlib import sha256
from hmac import compare_digest

from fastapi import HTTPException, status

from app.core.config import get_settings
from app.schemas.payments import CreatePaymentIntentRequest, CreatePaymentIntentResponse, PaymentWebhookEvent
from app.services.unlock_service import create_unlock_token


@dataclass
class PaymentRecord:
    payment_id: str
    publisher_id: str
    article_id: str
    amount_cents: int
    currency: str
    status: str
    unlock_token: str | None = None


# In-memory storage for MVP bootstrap. Replace with a database before production.
PAYMENTS: dict[str, PaymentRecord] = {}
PROCESSED_EVENTS: set[str] = set()


def create_payment_intent(payload: CreatePaymentIntentRequest) -> CreatePaymentIntentResponse:
    payment_id = f"pay_{len(PAYMENTS) + 1:06d}"
    checkout_url = payload.return_url or "https://example-payments.local/checkout"

    PAYMENTS[payment_id] = PaymentRecord(
        payment_id=payment_id,
        publisher_id=payload.publisher_id,
        article_id=payload.article_id,
        amount_cents=payload.amount_cents,
        currency=payload.currency.upper(),
        status="pending"
    )

    return CreatePaymentIntentResponse(
        payment_id=payment_id,
        checkout_url=checkout_url,
        status="pending"
    )


def _build_expected_signature(event: PaymentWebhookEvent) -> str:
    settings = get_settings()
    source = f"{event.provider_event_id}:{event.payment_id}:{event.status}:{settings.payment_webhook_secret}"
    return sha256(source.encode("utf-8")).hexdigest()


def process_payment_webhook(event: PaymentWebhookEvent) -> dict[str, str | bool | None]:
    expected_signature = _build_expected_signature(event)
    if not compare_digest(expected_signature, event.signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid webhook signature")

    if event.provider_event_id in PROCESSED_EVENTS:
        return {"processed": False, "reason": "duplicate_event", "payment_id": event.payment_id}

    payment_record = PAYMENTS.get(event.payment_id)
    if payment_record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    payment_record.status = event.status
    unlock_token = None
    if event.status == "paid":
        unlock_token = create_unlock_token(
            payment_id=payment_record.payment_id,
            article_id=payment_record.article_id,
            publisher_id=payment_record.publisher_id
        )
        payment_record.unlock_token = unlock_token

    PROCESSED_EVENTS.add(event.provider_event_id)
    return {
        "processed": True,
        "payment_id": payment_record.payment_id,
        "status": payment_record.status,
        "unlock_token": unlock_token
    }


def get_article_pricing(article_id: str) -> dict[str, str | int]:
    return {
        "article_id": article_id,
        "amount_cents": 250,
        "currency": "EUR"
    }
