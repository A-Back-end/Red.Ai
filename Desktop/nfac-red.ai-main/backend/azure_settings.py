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
        "backup_key": os.getenv("AZURE_OPENAI_BACKUP_KEY", ""),
        "endpoint": endpoint,
        "api_version": os.getenv("OPENAI_API_VERSION", "2024-04-01-preview"),
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

# Default configuration for backward compatibility
DEFAULT_AZURE_CONFIG = {
    "endpoint": "https://neuroflow-hub.openai.azure.com",
    "api_version": "2024-04-01-preview",
    "gpt_deployment": "gpt-4.1",
    "dalle_deployment": "dall-e-3",
    "api_key": os.getenv("AZURE_OPENAI_API_KEY", "FM1DHQMuPkCX1TKRnIVVprIoQ1RwI6yaPBNEJ0gx3kdRUNMpprAlJQQJ99BGACYeBjFXJ3w3AAABACOGLuJD"),
    "backup_key": os.getenv("AZURE_OPENAI_BACKUP_KEY", "FM1DHQMuPkCX1TKRnIVVprIoQ1RwI6yaPBNEJ0gx3kdRUNMpprAlJQQJ99BGACYeBjFXJ3w3AAABACOGLuJD"),
    "use_azure_ad": False
} 