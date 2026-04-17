from dataclasses import dataclass
from hashlib import sha256
from hmac import compare_digest

from fastapi import HTTPException, status

from app.core.config import get_settings
from app.schemas.payments import (
    CompletePaymentRequest,
    CompletePaymentResponse,
    LegacyCreatePaymentIntentRequest,
    LegacyCreatePaymentIntentResponse,
    StartPaymentRequest,
    StartPaymentResponse,
)
from app.services.unlock_service import (
    build_unlock_cookie_name,
    build_unlock_cookie_value,
)


@dataclass
class PaymentRecord:
    payment_id: str
    publisher_id: str
    article_id: str
    article_url: str
    article_hash: str
    amount_cents: int
    currency: str
    status: str
    unlock_token: str | None = None
    provider_event_id: str | None = None


# In-memory storage for MVP bootstrap. Replace with a database before production.
PAYMENTS: dict[str, PaymentRecord] = {}
PROCESSED_EVENTS: set[str] = set()


def start_payment_session(payload: StartPaymentRequest) -> StartPaymentResponse:
    payment_id = f"pay_{len(PAYMENTS) + 1:06d}"
    checkout_url = payload.return_url or payload.article_url

    PAYMENTS[payment_id] = PaymentRecord(
        payment_id=payment_id,
        publisher_id=payload.publisher_id,
        article_id=payload.article_id,
        article_url=payload.article_url,
        article_hash=payload.article_hash,
        amount_cents=payload.amount_cents,
        currency=payload.currency.upper(),
        status="pending",
    )

    return StartPaymentResponse(
        payment_id=payment_id,
        checkout_url=checkout_url,
        spa_url=payload.return_url,
        status="pending",
    )


def create_payment_intent(payload: LegacyCreatePaymentIntentRequest) -> LegacyCreatePaymentIntentResponse:
    return LegacyCreatePaymentIntentResponse(**start_payment_session(payload).model_dump())


def _build_expected_signature(event: CompletePaymentRequest) -> str:
    settings = get_settings()
    source = f"{event.provider_event_id}:{event.payment_id}:paid:{settings.payment_webhook_secret}"
    return sha256(source.encode("utf-8")).hexdigest()


def complete_payment_session(event: CompletePaymentRequest) -> CompletePaymentResponse:
    settings = get_settings()
    if settings.env != "development" and event.signature:
        expected_signature = _build_expected_signature(event)
        if not compare_digest(expected_signature, event.signature):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid webhook signature")
    elif settings.env != "development":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing webhook signature")

    if event.provider_event_id in PROCESSED_EVENTS:
        return CompletePaymentResponse(processed=False, payment_id=event.payment_id, status="pending")

    payment_record = PAYMENTS.get(event.payment_id)
    if payment_record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    payment_record.status = "paid"
    payment_record.provider_event_id = event.provider_event_id
    unlock_token = build_unlock_cookie_value(
        payment_id=payment_record.payment_id,
        article_id=payment_record.article_id,
        publisher_id=payment_record.publisher_id,
        article_hash=payment_record.article_hash,
    )
    payment_record.unlock_token = unlock_token

    PROCESSED_EVENTS.add(event.provider_event_id)
    return CompletePaymentResponse(
        processed=True,
        payment_id=payment_record.payment_id,
        status=payment_record.status,
        unlock_cookie_name=build_unlock_cookie_name(payment_record.article_hash),
        unlock_expires_at=None,
        unlock_token=unlock_token,
    )


def process_payment_webhook(event: CompletePaymentRequest) -> CompletePaymentResponse:
    return complete_payment_session(event)


def get_payment_record(payment_id: str) -> PaymentRecord | None:
    return PAYMENTS.get(payment_id)


def get_unlock_cookie_name(article_hash: str) -> str:
    return build_unlock_cookie_name(article_hash)


def create_unlock_cookie_value(payment_record: PaymentRecord) -> str:
    return build_unlock_cookie_value(
        payment_id=payment_record.payment_id,
        article_id=payment_record.article_id,
        publisher_id=payment_record.publisher_id,
        article_hash=payment_record.article_hash,
    )


def get_article_pricing(article_id: str) -> dict[str, str | int]:
    return {
        "article_id": article_id,
        "amount_cents": 250,
        "currency": "EUR",
    }
