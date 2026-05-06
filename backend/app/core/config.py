from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    GOOGLE_CLIENT_ID: str
    APPLE_CLIENT_ID: str
    APPLE_TEAM_ID: str
    APPLE_KEY_ID: str

    OPENCAGE_API_KEY: str = ""
    DEFAULT_LANGUAGE: str = "en"
    ALLOWED_LANGUAGES: list[str] = ["en", "fr", "es", "ar", "tr"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
