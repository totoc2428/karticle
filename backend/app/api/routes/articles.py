from fastapi import APIRouter

from app.services.payment_service import get_article_pricing

router = APIRouter(prefix="/v1/articles", tags=["articles"])


@router.get("/{article_id}/pricing")
def get_pricing(article_id: str) -> dict[str, str | int]:
    return get_article_pricing(article_id)
