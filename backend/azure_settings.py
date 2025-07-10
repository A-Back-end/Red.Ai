"""
Azure OpenAI Configuration Settings
Centralized configuration for Azure OpenAI services
"""

import os
from typing import Dict, Optional

def get_azure_config() -> Optional[Dict]:
    """
    Get Azure OpenAI configuration from environment variables
    Returns None if not properly configured
    """
    
    # Check if we have the required environment variables
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    
    if not api_key or not endpoint:
        return None
    
    config = {
        "api_key": api_key,
        "backup_key": os.getenv("AZURE_OPENAI_BACKUP_KEY", "AZURE_OPENAI_API_KEY"),
        "endpoint": endpoint,
        "api_version": os.getenv("OPENAI_API_VERSION", "AZURE_OPENAI_API_KEY"),
        "gpt_deployment": os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4.1"),
        "dalle_deployment": os.getenv("AZURE_DALLE_DEPLOYMENT_NAME", "dall-e-3"),
        "use_azure_ad": os.getenv("USE_AZURE_AD", "false").lower() == "true"
    }
    
    return config

def validate_azure_config() -> bool:
    """Validate if Azure configuration is complete"""
    config = get_azure_config()
    
    if not config:
        return False
    
    required_fields = ["api_key", "endpoint", "api_version", "gpt_deployment", "dalle_deployment"]
    
    return all(config.get(field) for field in required_fields)

def get_azure_openai_settings() -> dict:
    """Загрузка настроек Azure OpenAI из .env"""
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    backup_key = os.getenv("AZURE_OPENAI_BACKUP_KEY")

    if not api_key:
        raise ValueError("AZURE_OPENAI_API_KEY не найден в переменных окружения.")

    return {
        "api-key": api_key,
        "backup-key": backup_key,  # Может быть None, если не задан
        "api-version": os.getenv("AZURE_OPENAI_API_VERSION", "2024-04-01-preview"),
        "endpoint": os.getenv("AZURE_OPENAI_ENDPOINT"),
        "dalle_deployment": os.getenv("AZURE_DALLE_DEPLOYMENT_NAME", "dall-e-3"),
        "gpt_deployment": os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4-turbo"),
    }

def get_dalle_settings() -> dict:
    """Получение настроек для DALL-E на основе Azure"""
    azure_settings = get_azure_openai_settings()
    if not azure_settings.get("endpoint"):
        raise ValueError("AZURE_OPENAI_ENDPOINT не найден для DALL-E сервиса.")
        
    return {
        "api_key": azure_settings["api-key"],
        "api_version": azure_settings["api-version"],
        "azure_endpoint": azure_settings["endpoint"],
        "deployment_name": azure_settings["dalle_deployment"],
    }

# --- Старый код для обратной совместимости (можно удалить в будущем) ---

AZURE_OPENAI_CONFIG = {
    "default": {
        "api_type": "azure",
        "api_version": os.getenv("AZURE_OPENAI_API_VERSION", "2024-04-01-preview"),
        "api_key": os.getenv("AZURE_OPENAI_API_KEY"),
        "backup_key": os.getenv("AZURE_OPENAI_BACKUP_KEY"),
        "endpoint": os.getenv("AZURE_OPENAI_ENDPOINT"),
        "region": os.getenv("AZURE_OPENAI_REGION", "eastus"),
    },
    "dall-e-3": {
        "deployment": os.getenv("AZURE_DALLE_DEPLOYMENT_NAME", "dall-e-3"),
        "api_version": "2024-04-01-preview",
    },
    "gpt-4": {
        "deployment": os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4"),
        "api_version": "2023-12-01-preview",
    }
} 