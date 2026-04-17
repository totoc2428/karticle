from fastapi import APIRouter, Response

from app.core.config import get_settings
from app.schemas.payments import (
    CompletePaymentRequest,
    CompletePaymentResponse,
    LegacyCreatePaymentIntentRequest,
    LegacyCreatePaymentIntentResponse,
    StartPaymentRequest,
    StartPaymentResponse,
)
from app.services.payment_service import (
    complete_payment_session,
    create_payment_intent,
    get_payment_record,
    get_unlock_cookie_name,
    process_payment_webhook,
    start_payment_session,
)

router = APIRouter(prefix="/v1/payments", tags=["payments"])
settings = get_settings()


@router.post("/start", response_model=StartPaymentResponse)
def post_start_payment(payload: StartPaymentRequest) -> StartPaymentResponse:
    return start_payment_session(payload)


@router.post("/complete", response_model=CompletePaymentResponse)
def post_complete_payment(payload: CompletePaymentRequest, response: Response) -> CompletePaymentResponse:
    result = complete_payment_session(payload)
    payment_record = get_payment_record(payload.payment_id)
    if payment_record and result.unlock_token:
        cookie_name = get_unlock_cookie_name(payment_record.article_hash)
        cookie_secure = settings.env != "development"
        same_site = "none" if cookie_secure else "lax"
        response.set_cookie(
            key=cookie_name,
            value=result.unlock_token,
            max_age=60 * 60 * 24 * settings.unlock_cookie_max_age_days,
            httponly=True,
            secure=cookie_secure,
            samesite=same_site,
            path="/",
        )
    return result


@router.post("/create-intent", response_model=LegacyCreatePaymentIntentResponse)
def post_create_intent(payload: LegacyCreatePaymentIntentRequest) -> LegacyCreatePaymentIntentResponse:
    return create_payment_intent(payload)


@router.post("/webhook")
def post_webhook(event: CompletePaymentRequest) -> CompletePaymentResponse:
    return process_payment_webhook(event)
