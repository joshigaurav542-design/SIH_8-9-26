from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Artisan Companion API"
    VERSION: str = "1.0.0"
    SIH_PROBLEM_ID: str = "SIH26090"
    TEAM_NAME: str = "Bro Code"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000"
    ]
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./artisan_companion.db")
    
    # ONDC / Beckn Network Settings
    ONDC_BPP_ID: str = "artisan-bpp.brocode.sih.in"
    ONDC_BPP_URI: str = "http://localhost:8000/api/v1/ondc"
    # Server config
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # AI Vision & Voice Settings
    BHASHINI_API_KEY: str = "mock-bhashini-api-key"
    BHASHINI_USER_ID: str = "mock-user-id"
    GEMINI_API_KEY: str = "your-google-gemini-api-key"
    WHISPER_MODEL_SIZE: str = "base"

    # Additional ONDC keys
    ONDC_BAP_ID: str = "buyer-app-network.ondc.org"
    ONDC_SIGNING_PRIVATE_KEY: str = "mock-ed25519-private-key"
    ONDC_SUBSCRIBER_ID: str = "artisan-network-provider"

    # Cache
    REDIS_URL: str = "redis://localhost:6379/0"

    # Vernacular Speech Config
    SUPPORTED_LANGUAGES: List[str] = ["hi-IN", "bn-IN", "ta-IN", "te-IN", "mr-IN", "gu-IN", "en-IN"]

    class Config:
        case_sensitive = False
        extra = "ignore"
        env_file = ".env"

settings = Settings()

