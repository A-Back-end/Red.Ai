"""
Configuration module for RED AI API
Loads environment variables and provides configuration classes
"""

import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv("dotenv/.env")

class Settings:
    """Application settings from environment variables"""
    
    # API Configuration
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Azure OpenAI Configuration
    AZURE_OPENAI_API_KEY: str = os.getenv("AZURE_OPENAI_API_KEY", "AZURE_OPENAI_KEY_1")
    AZURE_OPENAI_BACKUP_KEY: str = os.getenv("AZURE_OPENAI_BACKUP_KEY", "AZURE_OPENAI_BACKUP_KEY")
    AZURE_OPENAI_ENDPOINT: str = os.getenv("AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_ENDPOINT")
    AZURE_OPENAI_API_VERSION: str = os.getenv("AZURE_OPENAI_API_VERSION", "2024-05-01-preview")
    AZURE_OPENAI_DEPLOYMENT_NAME: str = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4.1")
    USE_AZURE_AD: bool = os.getenv("USE_AZURE_AD", "false").lower() == "true"
    AZURE_DALLE_DEPLOYMENT_NAME: str = os.getenv("AZURE_DALLE_DEPLOYMENT_NAME", "dall-e-3")

    # Legacy OpenAI for backward compatibility (deprecated)
    AI_MODEL: str = os.getenv("AI_MODEL", "gpt-4")
    AI_TEMPERATURE: float = float(os.getenv("AI_TEMPERATURE", "0.7"))
    AI_MAX_TOKENS: int = int(os.getenv("AI_MAX_TOKENS", "1000"))
    
    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:3000,https://redai.site"
    ).split(",")
    
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./red_ai.db")
    
    # Redis Configuration
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", "red_ai.log")
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB
    ALLOWED_FILE_TYPES: List[str] = os.getenv(
        "ALLOWED_FILE_TYPES", 
        "image/jpeg,image/png,image/gif,image/webp"
    ).split(",")
    
    @property
    def is_azure_openai_configured(self) -> bool:
        """Check if Azure OpenAI API key is configured"""
        return bool(self.AZURE_OPENAI_API_KEY)
    
    def is_ai_configured(self) -> bool:
        """Check if any AI service is configured"""
        return self.is_azure_openai_configured
    
    def get_cors_origins(self) -> List[str]:
        """Get cleaned CORS origins list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS if origin.strip()]
    
    def __repr__(self):
        return f"<Settings(debug={self.DEBUG}, azure_openai={self.is_azure_openai_configured})>"

# Global settings instance
settings = Settings()
