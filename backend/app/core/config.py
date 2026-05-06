from pathlib import Path
from pydantic import field_validator
from pydantic_settings import BaseSettings

_env_file = Path(__file__).parents[2] / ".env"


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    GOOGLE_CLIENT_ID: str = ""
    APPLE_CLIENT_ID: str = ""
    APPLE_TEAM_ID: str = ""
    APPLE_KEY_ID: str = ""

    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GOOGLE_MAPS_API_KEY: str = ""
    OPENCAGE_API_KEY: str = ""
    DEFAULT_LANGUAGE: str = "en"
    ALLOWED_LANGUAGES: list[str] = ["en", "fr", "es", "ar", "tr"]

    model_config = {"env_file": _env_file, "env_file_encoding": "utf-8"}

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def fix_database_url(cls, v: str) -> str:
        if v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v


settings = Settings()
