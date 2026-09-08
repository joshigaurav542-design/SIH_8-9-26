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
    ONDC_GATEWAY_URL: str = "https://staging.gateway.proteantech.in"
    
    # Vernacular Speech Config
    SUPPORTED_LANGUAGES: List[str] = ["hi-IN", "bn-IN", "ta-IN", "te-IN", "mr-IN", "gu-IN", "en-IN"]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
