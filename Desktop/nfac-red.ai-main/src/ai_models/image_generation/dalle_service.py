"""
DALL-E Image Generation Service
Интеграция с OpenAI DALL-E для генерации изображений
"""

import openai
import asyncio
import base64
import io
from typing import Optional, Dict, Any, List
from PIL import Image
import requests
from dataclasses import dataclass

from ..base.ai_service import BaseAIService
from ...backend.core.config import settings
from ...backend.core.exceptions import AIServiceError, QuotaExceededError


@dataclass
class ImageGenerationRequest:
    """Запрос на генерацию изображения"""
    prompt: str
    style: str = "photorealistic"
    quality: str = "standard"  # standard, hd
    size: str = "1024x1024"    # 1024x1024, 1792x1024, 1024x1792
    n: int = 1
    response_format: str = "url"  # url, b64_json


@dataclass
class ImageGenerationResponse:
    """Ответ от сервиса генерации"""
    success: bool
    image_url: Optional[str] = None
    image_data: Optional[bytes] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class DALLEService(BaseAIService):
    """Сервис генерации изображений через DALL-E"""
    
    def __init__(self):
        super().__init__("dalle")
        self.client = None
        self.setup_client()
    
    def setup_client(self):
        """Настройка клиента OpenAI"""
        try:
            if settings.OPENAI_API_KEY:
                openai.api_key = settings.OPENAI_API_KEY
                if settings.OPENAI_ORG_ID:
                    openai.organization = settings.OPENAI_ORG_ID
                self.client = openai
                self.is_available = True
            else:
                self.is_available = False
                self.error_message = "OpenAI API key not configured"
        except Exception as e:
            self.is_available = False
            self.error_message = f"Failed to setup OpenAI client: {str(e)}"
    
    async def generate_image(self, request: ImageGenerationRequest) -> ImageGenerationResponse:
        """Генерация изображения через DALL-E"""
        if not self.is_available:
            return ImageGenerationResponse(
                success=False,
                error=self.error_message
            )
        
        try:
            # Улучшение промпта для дизайна интерьера
            enhanced_prompt = self._enhance_prompt(request.prompt, request.style)
            
            # Запрос к DALL-E
            response = await self._make_dalle_request(
                prompt=enhanced_prompt,
                size=request.size,
                quality=request.quality,
                n=request.n,
                response_format=request.response_format
            )
            
            if response.get("data"):
                image_data = response["data"][0]
                
                if request.response_format == "url":
                    return ImageGenerationResponse(
                        success=True,
                        image_url=image_data.get("url"),
                        metadata={
                            "prompt": enhanced_prompt,
                            "original_prompt": request.prompt,
                            "style": request.style,
                            "model": "dall-e-3"
                        }
                    )
                else:
                    # base64 format
                    image_bytes = base64.b64decode(image_data.get("b64_json"))
                    return ImageGenerationResponse(
                        success=True,
                        image_data=image_bytes,
                        metadata={
                            "prompt": enhanced_prompt,
                            "original_prompt": request.prompt,
                            "style": request.style,
                            "model": "dall-e-3"
                        }
                    )
            else:
                return ImageGenerationResponse(
                    success=False,
                    error="No image data received from DALL-E"
                )
                
        except Exception as e:
            return ImageGenerationResponse(
                success=False,
                error=f"DALL-E generation failed: {str(e)}"
            )
    
    async def _make_dalle_request(
        self,
        prompt: str,
        size: str = "1024x1024",
        quality: str = "standard",
        n: int = 1,
        response_format: str = "url"
    ) -> Dict[str, Any]:
        """Выполнение запроса к DALL-E API"""
        try:
            response = await asyncio.to_thread(
                self.client.images.generate,
                model="dall-e-3",
                prompt=prompt,
                size=size,
                quality=quality,
                n=n,
                response_format=response_format
            )
            return response.model_dump()
        except openai.RateLimitError as e:
            raise QuotaExceededError("DALL-E", 0, 0)
        except openai.AuthenticationError as e:
            raise AIServiceError("DALL-E", "Invalid API key")
        except Exception as e:
            raise AIServiceError("DALL-E", str(e))
    
    def _enhance_prompt(self, prompt: str, style: str) -> str:
        """Улучшение промпта для дизайна интерьера"""
        style_modifiers = {
            "photorealistic": "photorealistic, high-quality interior design, professional photography",
            "artistic": "artistic interior design, creative, stylized",
            "minimalist": "minimalist interior design, clean lines, simple, modern",
            "luxury": "luxury interior design, elegant, premium materials, sophisticated",
            "scandinavian": "scandinavian interior design, hygge, natural materials, light colors",
            "modern": "modern interior design, contemporary, sleek, current trends"
        }
        
        base_prompt = f"Interior design: {prompt}"
        style_modifier = style_modifiers.get(style, "interior design")
        
        enhanced = f"{base_prompt}, {style_modifier}, professional lighting, high resolution"
        
        return enhanced
    
    async def download_image(self, url: str) -> Optional[bytes]:
        """Загрузка изображения по URL"""
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            return response.content
        except Exception as e:
            raise AIServiceError("DALL-E", f"Failed to download image: {str(e)}")
    
    async def resize_image(self, image_data: bytes, max_size: tuple = (1024, 1024)) -> bytes:
        """Изменение размера изображения"""
        try:
            image = Image.open(io.BytesIO(image_data))
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            output = io.BytesIO()
            image.save(output, format='PNG')
            return output.getvalue()
        except Exception as e:
            raise AIServiceError("DALL-E", f"Failed to resize image: {str(e)}")
    
    def get_usage_info(self) -> Dict[str, Any]:
        """Получение информации об использовании"""
        return {
            "service": "dall-e-3",
            "model": "dall-e-3",
            "available": self.is_available,
            "features": [
                "High-quality image generation",
                "Interior design optimization",
                "Multiple styles support",
                "Professional prompts"
            ],
            "limits": {
                "max_requests_per_minute": 5,
                "max_requests_per_day": 200,
                "supported_sizes": ["1024x1024", "1792x1024", "1024x1792"]
            }
        }


# Фабрика для создания сервиса
def create_dalle_service() -> DALLEService:
    """Создание экземпляра DALL-E сервиса"""
    return DALLEService()


# Утилиты для работы с изображениями
class ImageUtils:
    """Утилиты для работы с изображениями"""
    
    @staticmethod
    def is_valid_size(size: str) -> bool:
        """Проверка корректности размера"""
        valid_sizes = ["1024x1024", "1792x1024", "1024x1792"]
        return size in valid_sizes
    
    @staticmethod
    def get_aspect_ratio(size: str) -> float:
        """Получение соотношения сторон"""
        width, height = map(int, size.split('x'))
        return width / height
    
    @staticmethod
    def suggest_size_for_room(room_type: str) -> str:
        """Предложение размера изображения для типа помещения"""
        wide_rooms = ["living_room", "kitchen", "dining_room"]
        tall_rooms = ["bathroom", "hallway", "closet"]
        
        if room_type in wide_rooms:
            return "1792x1024"
        elif room_type in tall_rooms:
            return "1024x1792"
        else:
            return "1024x1024" 