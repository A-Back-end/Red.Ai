"""
Red.AI Backend Configuration
Настройки приложения и переменные окружения
"""

import os
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    """Конфигурация приложения"""
    
    # Основные настройки
    APP_NAME: str = "Red.AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # База данных
    DATABASE_URL: Optional[str] = None
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None
    
    # AI Services
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_ORG_ID: Optional[str] = None
    HUGGINGFACE_API_KEY: Optional[str] = None
    CLAUDE_API_KEY: Optional[str] = None
    REPLICATE_API_TOKEN: Optional[str] = None
    
    # Azure OpenAI
    AZURE_OPENAI_API_KEY: Optional[str] = None
    AZURE_OPENAI_ENDPOINT: Optional[str] = None
    AZURE_OPENAI_API_VERSION: str = "2023-12-01-preview"
    
    # Аутентификация
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://red-ai.vercel.app"
    ]
    
    # Файловое хранилище
    STORAGE_BUCKET: str = "redai-storage"
    STORAGE_PATH: str = "uploads/"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_PASSWORD: Optional[str] = None
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 60
    
    # Логирование
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/app.log"
    
    # Email
    EMAIL_HOST: Optional[str] = None
    EMAIL_PORT: int = 587
    EMAIL_USER: Optional[str] = None
    EMAIL_PASSWORD: Optional[str] = None
    
    # Мониторинг
    SENTRY_DSN: Optional[str] = None
    SENTRY_ENVIRONMENT: str = "development"
    
    # Feature Flags
    ENABLE_3D_VIEWER: bool = True
    ENABLE_CHAT_INTERFACE: bool = True
    ENABLE_PINTEREST_INTEGRATION: bool = False
    ENABLE_ANALYTICS: bool = False
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Создание экземпляра настроек
settings = Settings()

# Проверка обязательных переменных
def validate_settings():
    """Валидация настроек при запуске"""
    required_vars = []
    
    if not settings.SECRET_KEY:
        required_vars.append("SECRET_KEY")

    if not settings.OPENAI_API_KEY and not settings.AZURE_OPENAI_API_KEY:
        required_vars.append("OPENAI_API_KEY или AZURE_OPENAI_API_KEY")
    
    if not settings.DATABASE_URL and not settings.SUPABASE_URL:
        required_vars.append("DATABASE_URL или SUPABASE_URL")
    
    if required_vars:
        raise ValueError(f"Отсутствуют обязательные переменные: {', '.join(required_vars)}")

# Настройки для разных окружений
def get_database_url() -> str:
    """Получение URL базы данных"""
    if settings.SUPABASE_URL:
        return settings.SUPABASE_URL
    return settings.DATABASE_URL or "sqlite:///./redai.db"

def get_ai_service_config() -> dict:
    """Конфигурация AI сервисов"""
    return {
        "openai": {
            "api_key": settings.OPENAI_API_KEY,
            "org_id": settings.OPENAI_ORG_ID,
            "enabled": bool(settings.OPENAI_API_KEY)
        },
        "azure_openai": {
            "api_key": settings.AZURE_OPENAI_API_KEY,
            "endpoint": settings.AZURE_OPENAI_ENDPOINT,
            "api_version": settings.AZURE_OPENAI_API_VERSION,
            "enabled": bool(settings.AZURE_OPENAI_API_KEY)
        },
        "huggingface": {
            "api_key": settings.HUGGINGFACE_API_KEY,
            "enabled": bool(settings.HUGGINGFACE_API_KEY)
        },
        "claude": {
            "api_key": settings.CLAUDE_API_KEY,
            "enabled": bool(settings.CLAUDE_API_KEY)
        }
    }

def get_cors_config() -> dict:
    """Конфигурация CORS"""
    return {
        "allow_origins": settings.ALLOWED_ORIGINS,
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }

# Логирование настроек (без секретных данных)
def log_settings():
    """Логирование настроек для отладки"""
    return {
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG,
        "host": settings.HOST,
        "port": settings.PORT,
        "features": {
            "3d_viewer": settings.ENABLE_3D_VIEWER,
            "chat_interface": settings.ENABLE_CHAT_INTERFACE,
            "pinterest": settings.ENABLE_PINTEREST_INTEGRATION,
            "analytics": settings.ENABLE_ANALYTICS
        }
    } 