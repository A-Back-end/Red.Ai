"""
Azure OpenAI Service for RED AI
Handles Azure OpenAI API interactions with authentication and error handling
"""

import os
import json
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime

# Import Azure settings
try:
    from azure_settings import get_azure_config
    AZURE_CONFIG = get_azure_config()
except ImportError:
    print("⚠️  azure_settings.py not found. Using environment variables only.")
    AZURE_CONFIG = None

# Azure OpenAI imports
try:
    from openai import AzureOpenAI
    from azure.identity import DefaultAzureCredential, get_bearer_token_provider
    AZURE_AD_AVAILABLE = True
except ImportError:
    print("⚠️  Azure AD authentication not available. Using API key authentication only.")
    from openai import AzureOpenAI
    AZURE_AD_AVAILABLE = False

class AzureOpenAIService:
    """Azure OpenAI service with AD and API key authentication"""
    
    def __init__(self, use_azure_ad: bool = False):
        """Initialize Azure OpenAI service"""
        # Use Azure config if available, otherwise fall back to environment variables
        if AZURE_CONFIG:
            self.endpoint = AZURE_CONFIG["endpoint"]
            self.api_version = AZURE_CONFIG["api_version"]
            self.deployment_name = AZURE_CONFIG["gpt_deployment"]
            self.azure_keys = [AZURE_CONFIG["api_key"], AZURE_CONFIG["backup_key"]]
            print("✅ Loading Azure configuration from azure_settings.py")
        else:
            self.endpoint = os.getenv("AZURE_OPENAI_ENDPOINT") or os.getenv("AZURE_ENDPOINT_KEY")
            self.api_version = os.getenv("AZURE_OPENAI_API_VERSION") or os.getenv("OPENAI_API_VERSION", "2024-05-01-preview")
            self.deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4.1")
            
            # Use correct environment variable names for Azure OpenAI API keys
            self.azure_keys = [
                os.getenv("AZURE_OPENAI_API_KEY") or os.getenv("AZURE_OPENAI_KEY"),
                os.getenv("AZURE_OPENAI_API_KEY_2") or os.getenv("AZURE_OPENAI_KEY_2")
            ]
        
        # Validate configuration
        self.config_valid = self._validate_configuration()
        
        self.use_azure_ad = use_azure_ad and AZURE_AD_AVAILABLE
        self.client = None
        
        if self.config_valid:
            self.client = self._initialize_client()
        else:
            print("❌ Azure OpenAI configuration invalid. Service will not be available.")
    
    def _validate_configuration(self) -> bool:
        """Validate Azure OpenAI configuration"""
        # Validate that we have actual API keys, not placeholder values
        if not self.azure_keys[0] or self.azure_keys[0].startswith("AZURE_"):
            print("❌ Azure OpenAI API key not configured")
        
        if not self.azure_keys[1] or self.azure_keys[1].startswith("AZURE_"):
            print("⚠️  Backup Azure OpenAI API key not configured")
        
        # Ensure endpoint is correctly formatted
        if not self.endpoint.endswith('/'):
            self.endpoint = self.endpoint + '/'
        
        has_api_key = bool(self.azure_keys[0])
        has_endpoint = bool(self.endpoint)
        has_api_version = bool(self.api_version)
        has_deployment = bool(self.deployment_name)
        
        config_status = {
            "hasApiKey": has_api_key,
            "hasEndpoint": has_endpoint, 
            "hasApiVersion": has_api_version,
            "hasDeployment": has_deployment
        }
        
        print(f"Azure OpenAI Configuration: {json.dumps(config_status, indent=2)}")
        
        if not all(config_status.values()):
            print("❌ Missing Azure OpenAI configuration:")
            if not has_api_key:
                print("   - AZURE_OPENAI_KEY или AZURE_OPENAI_API_KEY not set")
            if not has_endpoint:
                print("   - AZURE_OPENAI_ENDPOINT not set")
            if not has_api_version:
                print("   - OPENAI_API_VERSION not set")
            if not has_deployment:
                print("   - AZURE_OPENAI_DEPLOYMENT_NAME not set")
            return False
        
        return True
        
    def _initialize_client(self) -> Optional[AzureOpenAI]:
        """Initialize Azure OpenAI client with AD or API key authentication"""
        
        if not self.config_valid:
            return None
            
        if self.use_azure_ad and AZURE_AD_AVAILABLE:
            print("🔐 Initializing Azure OpenAI with Azure AD authentication...")
            try:
                token_provider = get_bearer_token_provider(
                    DefaultAzureCredential(), 
                    "https://cognitiveservices.azure.com/.default"
                )
                
                client = AzureOpenAI(
                    api_version=self.api_version,
                    azure_endpoint=self.endpoint,
                    azure_ad_token_provider=token_provider
                )
                
                print("✅ Azure AD authentication successful")
                return client
                
            except Exception as e:
                print(f"❌ Azure AD authentication failed: {e}")
                print("🔄 Falling back to API key authentication...")
                
        # Fallback to API key authentication
        if not self.azure_keys[0]:
            print("❌ No API key available for authentication")
            return None
            
        print("🔑 Initializing Azure OpenAI with API key authentication...")
        try:
            client = AzureOpenAI(
                api_key=self.azure_keys[0],
                api_version=self.api_version,
                azure_endpoint=self.endpoint
            )
            
            print("✅ API key authentication successful")
            return client
        except Exception as e:
            print(f"❌ Failed to initialize Azure OpenAI client: {e}")
            return None
    
    def is_configured(self) -> bool:
        """Check if the service is properly configured"""
        return self.config_valid and self.client is not None
    
    # DALL-E image generation removed - using BFL (Black Forest Labs) instead
    
    async def analyze_image(self, image_base64: str, prompt: str) -> Dict:
        """Analyze image using GPT-4 Vision"""
        if not self.is_configured():
            return {
                "success": False,
                "error": "Azure OpenAI service not configured properly"
            }
            
        try:
            print(f"👁️ Analyzing image with GPT-4 Vision...")
            
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            
            print(f"✅ Image analysis completed")
            print(f"📊 Analysis: {content[:200]}...")
            
            return {
                "success": True,
                "analysis": content,
                "tokens_used": response.usage.total_tokens if response.usage else 0
            }
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Image analysis failed: {e}")
            
            # Check for common authentication errors
            if "401" in error_msg or "Access denied" in error_msg:
                error_msg = "Authentication failed. Please check your Azure OpenAI API key and endpoint configuration."
            elif "403" in error_msg:
                error_msg = "Access forbidden. Please check your Azure OpenAI permissions and quotas."
            elif "429" in error_msg:
                error_msg = "Rate limit exceeded. Please try again later or check your quota."
            
            return {
                "success": False,
                "error": error_msg
            }
    
    async def chat_completion(self, messages: List[Dict], max_tokens: int = 1000) -> Dict:
        """Generate chat completion using GPT-4"""
        if not self.is_configured():
            return {
                "success": False,
                "error": "Azure OpenAI service not configured properly"
            }
            
        try:
            print(f"💬 Generating chat completion...")
            
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            
            print(f"✅ Chat completion generated")
            print(f"💬 Response: {content[:200]}...")
            
            return {
                "success": True,
                "content": content,
                "tokens_used": response.usage.total_tokens if response.usage else 0
            }
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Chat completion failed: {e}")
            
            # Check for common authentication errors
            if "401" in error_msg or "Access denied" in error_msg:
                error_msg = "Authentication failed. Please check your Azure OpenAI API key and endpoint configuration."
            elif "403" in error_msg:
                error_msg = "Access forbidden. Please check your Azure OpenAI permissions and quotas."
            elif "429" in error_msg:
                error_msg = "Rate limit exceeded. Please try again later or check your quota."
            
            return {
                "success": False,
                "error": error_msg
            }
    
    def switch_to_backup_key(self):
        """Switch to backup API key in case of rate limiting"""
        if len(self.azure_keys) > 1 and self.azure_keys[1] and not self.use_azure_ad:
            print("🔄 Switching to backup API key...")
            backup_key = self.azure_keys[1]
            
            try:
                self.client = AzureOpenAI(
                    api_key=backup_key,
                    api_version=self.api_version,
                    azure_endpoint=self.endpoint
                )
                
                print("✅ Switched to backup key")
            except Exception as e:
                print(f"❌ Failed to switch to backup key: {e}")
        else:
            print("❌ No backup key available")
    
    def get_service_info(self) -> Dict:
        """Get service configuration info"""
        return {
            "endpoint": self.endpoint,
            "api_version": self.api_version,
            "deployment_name": self.deployment_name,
            "use_azure_ad": self.use_azure_ad,
            "azure_ad_available": AZURE_AD_AVAILABLE,
            "configured": self.is_configured(),
            "has_api_key": bool(self.azure_keys[0]),
            "has_endpoint": bool(self.endpoint),
            "config_valid": self.config_valid
        }

# Factory function to create service instance
def create_azure_openai_service(use_azure_ad: bool = None) -> AzureOpenAIService:
    """Create Azure OpenAI service instance"""
    if use_azure_ad is None:
        use_azure_ad = os.getenv("USE_AZURE_AD", "false").lower() == "true"
    
    return AzureOpenAIService(use_azure_ad=use_azure_ad)

# Global function for backward compatibility
def generate_image_with_azure_dalle(prompt: str, style: str = "vivid", quality: str = "standard") -> Optional[str]:
    """Generate image with Azure DALL-E (backward compatibility function)"""
    try:
        service = create_azure_openai_service()
        
        if not service.is_configured():
            print("❌ Azure OpenAI service not configured")
            return None
            
        # This is a sync wrapper for the async function
        import asyncio
        
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        result = loop.run_until_complete(service.generate_image(prompt, style, quality))
        
        if result.get("success"):
            return result.get("image_url")
        else:
            print(f"❌ Image generation failed: {result.get('error')}")
            return None
            
    except Exception as e:
        print(f"❌ Error in generate_image_with_azure_dalle: {e}")
        return None

# ====================
# Пример использования Entra ID (Azure AD) авторизации для GPT-4.1
# (см. README_API.md для подробностей)
#
# from openai import AzureOpenAI
# from azure.identity import DefaultAzureCredential, get_bearer_token_provider
#
# token_provider = get_bearer_token_provider(
#     DefaultAzureCredential(),
#     "https://cognitiveservices.azure.com/.default"
# )
# client = AzureOpenAI(
#     api_version="2025-01-01-preview",
#     azure_endpoint="https://neuroflow-hub.openai.azure.com",
#     azure_ad_token_provider=token_provider
# )
# response = client.chat.completions.create(
#     model="gpt-4.1",
#     messages=[{"role": "user", "content": "Привет!"}],
#     max_tokens=100
# )
# print(response.choices[0].message.content)
# ====================

# Example usage and testing
async def test_azure_openai_service():
    """Test the Azure OpenAI service"""
    print("🧪 Testing Azure OpenAI Service...")
    print("=" * 50)
    
    # Create service instance
    service = create_azure_openai_service()
    
    # Show configuration
    info = service.get_service_info()
    print(f"📋 Service Configuration:")
    print(f"   Endpoint: {info['endpoint']}")
    print(f"   API Version: {info['api_version']}")
    print(f"   GPT Model: {info['deployment_name']}")
    print(f"   DALL-E Model: {info['dalle_deployment']}")
    print(f"   Azure AD: {'✅' if info['use_azure_ad'] else '❌'}")
    print(f"   Configured: {'✅' if info['configured'] else '❌'}")
    
    if not service.is_configured():
        print("❌ Service not properly configured, skipping tests")
        return
    
    # Test chat completion
    print(f"\n💬 Testing Chat Completion...")
    try:
        messages = [
            {"role": "user", "content": "Hello! Can you help me with interior design?"}
        ]
        
        result = await service.chat_completion(messages, max_tokens=100)
        
        if result["success"]:
            print(f"✅ Chat completion successful!")
            print(f"📝 Response: {result['content'][:100]}...")
            print(f"🎯 Tokens used: {result['tokens_used']}")
        else:
            print(f"❌ Chat completion failed: {result['error']}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    # Test image generation
    print(f"\n🎨 Testing Image Generation...")
    try:
        result = await service.generate_image(
            "A modern minimalist living room with natural light",
            style="vivid",
            quality="standard"
        )
        
        if result["success"]:
            print(f"✅ Image generation successful!")
            print(f"🔗 Image URL: {result['image_url'][:50]}...")
            print(f"🎨 Style: {result['style']}")
            print(f"📷 Quality: {result['quality']}")
        else:
            print(f"❌ Image generation failed: {result['error']}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    print(f"\n✅ Testing completed!")

if __name__ == "__main__":
    print("🚀 Azure OpenAI Service for RED AI")
    print("=" * 50)
    
    # Run tests
    asyncio.run(test_azure_openai_service())
    
    print("\n💡 Service ready for integration!")
    print("🔧 Configure your .env file with Azure OpenAI credentials")
    print("🎯 Use create_azure_openai_service() to get started") 