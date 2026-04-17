from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    env: str = Field(default="development", alias="KARTICLE_ENV")
    backend_host: str = Field(default="0.0.0.0", alias="KARTICLE_BACKEND_HOST")
    backend_port: int = Field(default=8000, alias="KARTICLE_BACKEND_PORT")
    allowed_origins: str = Field(default="http://localhost:5173", alias="KARTICLE_ALLOWED_ORIGINS")
    unlock_token_secret: str = Field(default="change-me", alias="KARTICLE_UNLOCK_TOKEN_SECRET")
    unlock_token_ttl_days: int = Field(default=30, alias="KARTICLE_UNLOCK_TOKEN_TTL_DAYS")
    payment_provider: str = Field(default="stripe", alias="KARTICLE_PAYMENT_PROVIDER")
    payment_webhook_secret: str = Field(default="change-me", alias="KARTICLE_PAYMENT_WEBHOOK_SECRET")
    payment_secret_key: str = Field(default="change-me", alias="KARTICLE_PAYMENT_SECRET_KEY")

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
