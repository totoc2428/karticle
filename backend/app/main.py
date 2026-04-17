from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.articles import router as articles_router
from app.api.routes.payments import router as payments_router
from app.api.routes.unlocks import router as unlocks_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="Karticle API",
    version="0.1.0",
    description="Single-article unlock payment API for embedded publisher widgets."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(articles_router)
app.include_router(payments_router)
app.include_router(unlocks_router)
