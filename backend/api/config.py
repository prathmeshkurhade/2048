"""
Application settings loaded from environment variables.
"""
from pathlib import Path
from pydantic_settings import BaseSettings

# Resolve .env relative to this file, not the CWD (important when running
# uvicorn from the backend/ folder rather than from inside api/).
_ENV_FILE = Path(__file__).parent / ".env"


class Settings(BaseSettings):
    DATABASE_URL: str
    CLERK_JWKS_URL: str
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = str(_ENV_FILE)
        extra = "ignore"


settings = Settings()
