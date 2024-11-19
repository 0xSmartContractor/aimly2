from typing import List
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl

class Settings(BaseSettings):
    PROJECT_NAME: str = "Aimly API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Backend API for Aimly pool analytics app"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str
    
    # OpenAI
    OPENAI_API_KEY: str
    
    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    STRIPE_PRICE_ID: str
    
    # CORS - Allow both web and mobile apps
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",     # Next.js frontend
        "http://localhost:8000",     # FastAPI Swagger UI
        "capacitor://localhost",     # Mobile app
        "http://localhost",          # Mobile app alternative
        "http://localhost:8080"      # Mobile app development
    ]
    
    class Config:
        env_file = ".env"

settings = Settings()