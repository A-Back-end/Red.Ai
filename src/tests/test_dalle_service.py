"""
Tests for DALL-E Image Generation Service
Тесты для сервиса генерации изображений DALL-E
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from dataclasses import dataclass
import base64

from src.ai_models.image_generation.dalle_service import (
    DALLEService,
    ImageGenerationRequest,
    ImageGenerationResponse,
    ImageUtils,
    create_dalle_service
)
from src.backend.core.exceptions import AIServiceError, QuotaExceededError


class TestDALLEService:
    """Тесты для DALLEService"""
    
    @pytest.fixture
    def dalle_service(self):
        """Фикстура для создания сервиса"""
        return DALLEService()
    
    @pytest.fixture
    def sample_request(self):
        """Пример запроса на генерацию"""
        return ImageGenerationRequest(
            prompt="Modern living room with minimalist design",
            style="photorealistic",
            quality="standard",
            size="1024x1024"
        )
    
    def test_service_initialization(self, dalle_service):
        """Тест инициализации сервиса"""
        assert dalle_service.service_name == "dalle"
        assert hasattr(dalle_service, 'client')
        assert hasattr(dalle_service, 'is_available')
    
    def test_prompt_enhancement(self, dalle_service):
        """Тест улучшения промпта"""
        original_prompt = "bedroom design"
        enhanced = dalle_service._enhance_prompt(original_prompt, "minimalist")
        
        assert "Interior design:" in enhanced
        assert "minimalist" in enhanced
        assert "professional lighting" in enhanced
        assert len(enhanced) > len(original_prompt)
    
    def test_enhance_prompt_different_styles(self, dalle_service):
        """Тест улучшения промпта для разных стилей"""
        prompt = "kitchen design"
        
        styles = ["photorealistic", "artistic", "minimalist", "luxury", "scandinavian", "modern"]
        
        for style in styles:
            enhanced = dalle_service._enhance_prompt(prompt, style)
            assert style in enhanced.lower()
            assert "Interior design:" in enhanced
    
    @pytest.mark.asyncio
    async def test_generate_image_success(self, dalle_service, sample_request):
        """Тест успешной генерации изображения"""
        # Мокаем OpenAI клиент
        mock_response = {
            "data": [
                {
                    "url": "https://example.com/generated-image.jpg"
                }
            ]
        }
        
        with patch.object(dalle_service, '_make_dalle_request', return_value=mock_response):
            response = await dalle_service.generate_image(sample_request)
            
            assert response.success is True
            assert response.image_url == "https://example.com/generated-image.jpg"
            assert response.error is None
            assert response.metadata is not None
            assert response.metadata["style"] == "photorealistic"
    
    @pytest.mark.asyncio
    async def test_generate_image_base64_format(self, dalle_service):
        """Тест генерации изображения в base64 формате"""
        request = ImageGenerationRequest(
            prompt="Modern bedroom",
            response_format="b64_json"
        )
        
        mock_b64_data = base64.b64encode(b"fake-image-data").decode()
        mock_response = {
            "data": [
                {
                    "b64_json": mock_b64_data
                }
            ]
        }
        
        with patch.object(dalle_service, '_make_dalle_request', return_value=mock_response):
            response = await dalle_service.generate_image(request)
            
            assert response.success is True
            assert response.image_data is not None
            assert response.image_url is None
    
    @pytest.mark.asyncio
    async def test_generate_image_service_unavailable(self, dalle_service, sample_request):
        """Тест генерации когда сервис недоступен"""
        dalle_service.is_available = False
        dalle_service.error_message = "Service unavailable"
        
        response = await dalle_service.generate_image(sample_request)
        
        assert response.success is False
        assert response.error == "Service unavailable"
        assert response.image_url is None
    
    @pytest.mark.asyncio
    async def test_generate_image_api_error(self, dalle_service, sample_request):
        """Тест обработки ошибок API"""
        with patch.object(dalle_service, '_make_dalle_request', side_effect=AIServiceError("DALL-E", "API Error")):
            response = await dalle_service.generate_image(sample_request)
            
            assert response.success is False
            assert "API Error" in response.error
    
    @pytest.mark.asyncio
    async def test_download_image_success(self, dalle_service):
        """Тест успешной загрузки изображения"""
        mock_response = Mock()
        mock_response.content = b"fake-image-content"
        mock_response.raise_for_status = Mock()
        
        with patch('requests.get', return_value=mock_response):
            result = await dalle_service.download_image("https://example.com/image.jpg")
            
            assert result == b"fake-image-content"
    
    @pytest.mark.asyncio
    async def test_download_image_failure(self, dalle_service):
        """Тест неудачной загрузки изображения"""
        with patch('requests.get', side_effect=Exception("Network error")):
            with pytest.raises(AIServiceError):
                await dalle_service.download_image("https://example.com/image.jpg")
    
    def test_get_usage_info(self, dalle_service):
        """Тест получения информации об использовании"""
        info = dalle_service.get_usage_info()
        
        assert info["service"] == "dall-e-3"
        assert info["model"] == "dall-e-3"
        assert "features" in info
        assert "limits" in info
        assert isinstance(info["features"], list)
        assert isinstance(info["limits"], dict)


class TestImageGenerationRequest:
    """Тесты для ImageGenerationRequest"""
    
    def test_default_values(self):
        """Тест значений по умолчанию"""
        request = ImageGenerationRequest(prompt="test prompt")
        
        assert request.prompt == "test prompt"
        assert request.style == "photorealistic"
        assert request.quality == "standard"
        assert request.size == "1024x1024"
        assert request.n == 1
        assert request.response_format == "url"
    
    def test_custom_values(self):
        """Тест кастомных значений"""
        request = ImageGenerationRequest(
            prompt="custom prompt",
            style="artistic",
            quality="hd",
            size="1792x1024",
            n=2,
            response_format="b64_json"
        )
        
        assert request.style == "artistic"
        assert request.quality == "hd"
        assert request.size == "1792x1024"
        assert request.n == 2
        assert request.response_format == "b64_json"


class TestImageUtils:
    """Тесты для ImageUtils"""
    
    def test_is_valid_size(self):
        """Тест проверки корректности размера"""
        assert ImageUtils.is_valid_size("1024x1024") is True
        assert ImageUtils.is_valid_size("1792x1024") is True
        assert ImageUtils.is_valid_size("1024x1792") is True
        assert ImageUtils.is_valid_size("512x512") is False
        assert ImageUtils.is_valid_size("invalid") is False
    
    def test_get_aspect_ratio(self):
        """Тест получения соотношения сторон"""
        assert ImageUtils.get_aspect_ratio("1024x1024") == 1.0
        assert ImageUtils.get_aspect_ratio("1792x1024") == 1.75
        assert ImageUtils.get_aspect_ratio("1024x1792") == pytest.approx(0.571, rel=1e-2)
    
    def test_suggest_size_for_room(self):
        """Тест предложения размера для типа помещения"""
        assert ImageUtils.suggest_size_for_room("living_room") == "1792x1024"
        assert ImageUtils.suggest_size_for_room("kitchen") == "1792x1024"
        assert ImageUtils.suggest_size_for_room("bathroom") == "1024x1792"
        assert ImageUtils.suggest_size_for_room("bedroom") == "1024x1024"


class TestServiceFactory:
    """Тесты для фабрики сервисов"""
    
    def test_create_dalle_service(self):
        """Тест создания сервиса через фабрику"""
        service = create_dalle_service()
        
        assert isinstance(service, DALLEService)
        assert service.service_name == "dalle"


# Интеграционные тесты (требуют реальный API ключ)
class TestDALLEServiceIntegration:
    """Интеграционные тесты для DALL-E сервиса"""
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_real_image_generation(self):
        """Тест реальной генерации изображения (только с API ключом)"""
        service = create_dalle_service()
        
        if not service.is_available:
            pytest.skip("DALL-E service not available (API key required)")
        
        request = ImageGenerationRequest(
            prompt="Small modern kitchen with white cabinets",
            style="photorealistic",
            quality="standard",
            size="1024x1024"
        )
        
        response = await service.generate_image(request)
        
        assert response.success is True
        assert response.image_url is not None
        assert response.error is None
        assert response.metadata is not None
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_real_image_download(self):
        """Тест реальной загрузки изображения"""
        service = create_dalle_service()
        
        if not service.is_available:
            pytest.skip("DALL-E service not available")
        
        # Используем заведомо рабочий URL изображения
        test_url = "https://via.placeholder.com/150x150.png"
        
        image_data = await service.download_image(test_url)
        
        assert image_data is not None
        assert len(image_data) > 0
        assert image_data.startswith(b'\x89PNG')  # PNG signature


# Фикстуры для тестов
@pytest.fixture
def mock_openai_response():
    """Мок ответа от OpenAI"""
    return {
        "data": [
            {
                "url": "https://example.com/generated-image.jpg",
                "revised_prompt": "Enhanced prompt from OpenAI"
            }
        ]
    }


@pytest.fixture
def mock_openai_error():
    """Мок ошибки от OpenAI"""
    return Exception("OpenAI API Error")


# Конфигурация pytest для модуля
def pytest_configure(config):
    """Конфигурация pytest"""
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests (deselect with '-m \"not integration\"')"
    ) 