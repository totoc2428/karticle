from fastapi import APIRouter

from app.schemas.payments import CreatePaymentIntentRequest, CreatePaymentIntentResponse, PaymentWebhookEvent
from app.services.payment_service import create_payment_intent, process_payment_webhook

router = APIRouter(prefix="/v1/payments", tags=["payments"])


@router.post("/create-intent", response_model=CreatePaymentIntentResponse)
def post_create_intent(payload: CreatePaymentIntentRequest) -> CreatePaymentIntentResponse:
    return create_payment_intent(payload)


@router.post("/webhook")
def post_webhook(event: PaymentWebhookEvent) -> dict[str, str | bool | None]:
    return process_payment_webhook(event)
