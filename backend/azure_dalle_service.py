"""
Azure DALL-E 3 Service for RED AI
Handles DALL-E 3 image generation using Azure OpenAI API
"""

import os
import json
import base64
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import requests
from io import BytesIO
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AzureDalleService:
    """Azure DALL-E 3 service for image generation"""
    
    def __init__(self):
        """Initialize Azure DALL-E 3 service"""
        # Azure OpenAI configuration
        self.api_key = os.getenv("AZURE_OPENAI_API_KEY", "AZURE_OPENAI_API_KEY")
        self.endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_ENDPOINT")
        self.api_version = os.getenv("AZURE_OPENAI_API_VERSION", "AZURE_OPENAI_API_VERSION")
        self.deployment_name = os.getenv("AZURE_DALLE_DEPLOYMENT_NAME", "dall-e-3")
        
        # Construct the full endpoint URL
        self.dalle_endpoint = f"{self.endpoint}/openai/deployments/{self.deployment_name}/images/generations"
        
        # Check service availability
        self.is_available = self._check_service_availability()
        
        logger.info(f"🎨 Azure DALL-E 3 Service initialized")
        logger.info(f"   Endpoint: {self.endpoint}")
        logger.info(f"   Available: {'✅' if self.is_available else '❌'}")
    
    def _check_service_availability(self) -> bool:
        """Check if Azure DALL-E 3 service is available"""
        if not self.api_key or not self.endpoint:
            logger.warning("Azure DALL-E 3 service not configured")
            return False
        return True
    
    def is_configured(self) -> bool:
        """Check if Azure DALL-E 3 service is configured"""
        return self.is_available
    
    async def generate_image(
        self,
        prompt: str,
        style: str = "vivid",
        quality: str = "standard",
        size: str = "1024x1024",
        n: int = 1
    ) -> Dict:
        """Generate image using Azure DALL-E 3"""
        
        if not self.is_configured():
            return {
                "success": False,
                "error": "Azure DALL-E 3 service not configured. Please set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT."
            }
        
        try:
            # Enhance the prompt for interior design
            enhanced_prompt = self._enhance_interior_prompt(prompt)
            
            result = await self._generate_with_azure_dalle(
                enhanced_prompt, style, quality, size, n
            )
            
            if result.get("success"):
                return result
            else:
                return {
                    "success": False,
                    "error": f"DALL-E 3 generation failed: {result.get('error', 'Unknown error')}"
                }
                
        except Exception as e:
            logger.error(f"❌ Azure DALL-E 3 generation failed: {e}")
            return {
                "success": False,
                "error": f"Azure DALL-E 3 generation error: {str(e)}"
            }
    
    async def _generate_with_azure_dalle(
        self, prompt: str, style: str, quality: str, size: str, n: int
    ) -> Dict:
        """Generate image using Azure DALL-E 3 API"""
        
        logger.info(f"🎨 Generating with Azure DALL-E 3...")
        
        headers = {
            "api-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        payload = {
            "prompt": prompt,
            "style": style,
            "quality": quality,
            "size": size,
            "n": n
        }
        
        # Add API version as query parameter
        url = f"{self.dalle_endpoint}?api-version={self.api_version}"
        
        logger.info(f"📝 Request: {prompt[:100]}...")
        logger.info(f"🔗 URL: {url}")
        
        # Run in thread to avoid blocking
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None, 
            lambda: requests.post(url, headers=headers, json=payload, timeout=120)
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get("data") and len(result["data"]) > 0:
                image_data = result["data"][0]
                image_url = image_data.get("url")
                revised_prompt = image_data.get("revised_prompt", prompt)
                
                logger.info(f"✅ Azure DALL-E 3 generation successful!")
                
                return {
                    "success": True,
                    "image_url": image_url,
                    "revised_prompt": revised_prompt,
                    "model": "DALL-E 3",
                    "service": "Azure OpenAI",
                    "prompt": prompt,
                    "parameters": {
                        "style": style,
                        "quality": quality,
                        "size": size
                    }
                }
            else:
                return {
                    "success": False,
                    "error": "No image generated by Azure DALL-E 3",
                    "service": "Azure OpenAI"
                }
        else:
            error_msg = f"Azure DALL-E 3 API error: {response.status_code}"
            try:
                error_detail = response.json()
                error_msg += f" - {error_detail}"
                logger.error(f"❌ API Error: {error_detail}")
            except:
                error_msg += f" - {response.text[:200]}"
                logger.error(f"❌ API Error: {response.text[:200]}")
            
            return {
                "success": False,
                "error": error_msg,
                "service": "Azure OpenAI"
            }
    
    def _enhance_interior_prompt(self, prompt: str) -> str:
        """Enhance prompt for interior design generation"""
        
        # Base enhancement for interior design
        enhanced = prompt.strip()
        
        # Add quality descriptors if not already present
        quality_terms = ["high quality", "professional", "realistic", "detailed"]
        if not any(term in enhanced.lower() for term in quality_terms):
            enhanced += " High quality, professional interior design, realistic lighting, detailed textures"
        
        # Add interior-specific terms if not present
        interior_terms = ["interior", "room", "design", "furniture"]
        if not any(term in enhanced.lower() for term in interior_terms):
            enhanced = f"Interior design: {enhanced}"
        
        # Ensure it's within DALL-E 3 limits (4000 characters max)
        if len(enhanced) > 4000:
            enhanced = enhanced[:3997] + "..."
        
        return enhanced
    
    def get_service_info(self) -> Dict:
        """Get service configuration info"""
        return {
            "service": "Azure DALL-E 3",
            "configured": self.is_configured(),
            "endpoint": self.endpoint,
            "deployment": self.deployment_name,
            "api_version": self.api_version,
            "available_qualities": ["standard", "hd"],
            "available_styles": ["vivid", "natural"],
            "available_sizes": ["1024x1024", "1024x1792", "1792x1024"]
        }

# Factory function
def create_azure_dalle_service() -> AzureDalleService:
    """Create Azure DALL-E 3 service instance"""
    return AzureDalleService()

# Example usage
async def test_azure_dalle_service():
    """Test the Azure DALL-E 3 service"""
    logger.info("🧪 Testing Azure DALL-E 3 Service...")
    logger.info("=" * 50)
    
    service = create_azure_dalle_service()
    
    # Show configuration
    info = service.get_service_info()
    logger.info(f"📋 Service Configuration:")
    logger.info(f"   Service: {info['service']}")
    logger.info(f"   Configured: {'✅' if info['configured'] else '❌'}")
    logger.info(f"   Endpoint: {info['endpoint']}")
    logger.info(f"   Deployment: {info['deployment']}")
    
    if not service.is_configured():
        logger.error("❌ Service not configured, skipping tests")
        return
    
    # Test image generation
    logger.info(f"\n🎨 Testing Image Generation...")
    try:
        result = await service.generate_image(
            "A modern minimalist living room with natural light, comfortable furniture, and clean lines",
            style="vivid",
            quality="standard"
        )
        
        if result["success"]:
            logger.info(f"✅ Image generation successful!")
            logger.info(f"🔗 Service used: {result.get('service')}")
            logger.info(f"🎨 Model: {result.get('model')}")
            logger.info(f"📝 Revised prompt: {result.get('revised_prompt', '')[:100]}...")
        else:
            logger.error(f"❌ Image generation failed: {result['error']}")
            
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
    
    logger.info(f"\n✅ Testing completed!")

if __name__ == "__main__":
    print("🚀 Azure DALL-E 3 Service for RED AI")
    print("=" * 50)
    
    # Run tests
    asyncio.run(test_azure_dalle_service())
    
    print("\n💡 Service ready for integration!")
    print("🔧 Configure your .env file with Azure credentials:")
    print("   - AZURE_OPENAI_API_KEY")
    print("   - AZURE_OPENAI_ENDPOINT")
    print("   - AZURE_DALLE_DEPLOYMENT_NAME") 