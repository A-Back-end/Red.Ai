"""
AI Service for RED AI
Handles AI interactions for floor plan analysis, design generation, and chat
"""

import os
import json
import base64
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime

# Import Azure OpenAI service
from azure_openai_service import create_azure_openai_service

class AIService:
    """AI Service for interior design assistance"""
    
    def __init__(self, api_key: Optional[str] = None, use_azure_ad: bool = None):
        """Initialize AI Service with Azure OpenAI"""
        # Initialize new Azure OpenAI service
        self.azure_service = create_azure_openai_service(use_azure_ad=use_azure_ad)
        
        # Legacy configuration for backward compatibility
        self.azure_api_key = api_key or os.getenv("AZURE_OPENAI_KEY") or os.getenv("AZURE_OPENAI_API_KEY") or "YOUR_AZURE_OPENAI_API_KEY_HERE"
        
        # Show service info
        service_info = self.azure_service.get_service_info()
        print(f"✅ Azure OpenAI Service initialized")
        print(f"   Endpoint: {service_info['endpoint']}")
        print(f"   Authentication: {'Azure AD' if service_info['use_azure_ad'] else 'API Key'}")
        print(f"   API Version: {service_info['api_version']}")
        print(f"   DALL-E Model: {service_info['dalle_deployment']}")

    async def analyze_floor_plan(self, image_data: bytes, filename: str) -> Dict:
        """Анализ планировки квартиры с помощью ИИ"""
        try:
            # Конвертируем изображение в base64
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Prompt для анализа планировки
            prompt = """
            Проанализируй этот план квартиры и верни JSON с:
            1. Количество комнат
            2. Общая площадь (примерно)
            3. Список комнат с типом и примерной площадью
            4. Рекомендации по улучшению планировки
            5. Возможности перепланировки
            
            Верни ответ в формате JSON:
            {
                "rooms_detected": число,
                "total_area": число,
                "rooms": [{"type": "тип", "area": число, "description": "описание"}],
                "suggestions": ["рекомендация1", "рекомендация2"],
                "renovation_ideas": ["идея1", "идея2"],
                "estimated_cost": {"min": число, "max": число}
            }
            """
            
            # Use new Azure OpenAI service
            response = await self._analyze_with_new_service(prompt, image_base64)
                
            return response
            
        except Exception as e:
            print(f"AI Analysis error: {e}")
            return self._mock_analysis()

    async def _analyze_with_new_service(self, prompt: str, image_base64: str) -> Dict:
        """Анализ с помощью нового Azure OpenAI сервиса"""
        try:
            result = await self.azure_service.analyze_image(image_base64, prompt)
            
            if result["success"]:
                # Парсим JSON из ответа
                try:
                    return json.loads(result["analysis"])
                except:
                    # Если не JSON, возвращаем мок анализ
                    print("📝 Response is not JSON, using mock analysis")
                    return self._mock_analysis()
            else:
                print(f"❌ Analysis failed: {result['error']}")
                return self._mock_analysis()
                
        except Exception as e:
            print(f"❌ New service error: {e}")
            return self._mock_analysis()

    async def generate_design_suggestions(self, room_type: str, style: str, budget: int) -> Dict:
        """Генерация дизайн предложений"""
        prompt = f"""
        Создай дизайн-предложения для {room_type} в стиле {style} с бюджетом {budget} рублей.
        
        Верни JSON с:
        - Цветовая схема
        - Рекомендуемая мебель 
        - Материалы отделки
        - Примерная смета
        - 3D идеи расстановки
        
        Формат:
        {{
            "color_scheme": ["цвет1", "цвет2", "цвет3"],
            "furniture": [{{"item": "название", "price": число, "description": "описание"}}],
            "materials": [{{"type": "тип", "price_per_sqm": число, "description": "описание"}}],
            "total_estimate": число,
            "layout_ideas": ["идея1", "идея2"]
        }}
        """
        
        try:
            result = await self.azure_service.chat_completion([
                {"role": "user", "content": prompt}
            ], max_tokens=10000)
            
            if result["success"]:
                try:
                    return json.loads(result["content"])
                except:
                    print("📝 Response is not JSON, using mock suggestions")
                    return self._mock_design_suggestions()
            else:
                print(f"❌ Design suggestions failed: {result['error']}")
                return self._mock_design_suggestions()
        except Exception as e:
            print(f"Design suggestions error: {e}")
            return self._mock_design_suggestions()

    def chat_completion(self, message: str, context: Optional[Dict] = None, conversation_id: Optional[str] = None) -> str:
        """Chat completion method for backward compatibility (sync version)"""
        try:
            # Run async method in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            response = loop.run_until_complete(self.chat_with_ai(message, context))
            loop.close()
            return response
        except Exception as e:
            print(f"Chat completion error: {e}")
            return "Извините, сейчас я не могу ответить. Попробуйте позже."

    async def chat_with_ai(self, message: str, context: Optional[Dict] = None) -> str:
        """Чат с ИИ помощником по дизайну"""
        system_prompt = """
        Ты - эксперт по дизайну интерьера и недвижимости. 
        Помогай пользователям с вопросами о:
        - Планировке квартир
        - Дизайне интерьера  
        - Выборе мебели
        - Ремонте и отделке
        - Расчете бюджета
        
        Отвечай практично, с конкретными советами и примерами.
        """
        
        try:
            messages = [{"role": "system", "content": system_prompt}]
            
            if context:
                messages.append({
                    "role": "user", 
                    "content": f"Контекст: {json.dumps(context, ensure_ascii=False)}"
                })
            
            messages.append({"role": "user", "content": message})
            
            result = await self.azure_service.chat_completion(messages, max_tokens=1000)
            
            if result["success"]:
                return result["content"]
            else:
                print(f"❌ Chat AI failed: {result['error']}")
                return "Извините, сейчас я не могу ответить. Попробуйте позже."
                
        except Exception as e:
            print(f"Chat AI error: {e}")
            return "Извините, сейчас я не могу ответить. Попробуйте позже."

    def _mock_analysis(self) -> Dict:
        """Мок анализ для демо"""
        return {
            "rooms_detected": 3,
            "total_area": 75.5,
            "rooms": [
                {"type": "гостиная", "area": 25.0, "description": "Просторная комната с большими окнами"},
                {"type": "спальня", "area": 18.5, "description": "Уютная спальня с местом для гардероба"},
                {"type": "кухня", "area": 12.0, "description": "Компактная кухня с возможностью расширения"},
                {"type": "ванная", "area": 6.0, "description": "Стандартная ванная комната"},
                {"type": "прихожая", "area": 8.0, "description": "Входная зона с местом для обуви"},
                {"type": "балкон", "area": 6.0, "description": "Застекленный балкон"}
            ],
            "suggestions": [
                "Рассмотрите объединение кухни с гостиной для увеличения пространства",
                "Добавьте перегородку в спальне для создания рабочей зоны",
                "Используйте светлые тона для визуального расширения пространства",
                "Установите встроенные шкафы для экономии места"
            ],
            "renovation_ideas": [
                "Перенос стены между кухней и гостиной",
                "Создание гардеробной в спальне",
                "Объединение ванной с туалетом",
                "Утепление и остекление балкона"
            ],
            "estimated_cost": {"min": 800000, "max": 1500000}
        }

    def _mock_design_suggestions(self) -> Dict:
        """Мок дизайн предложения"""
        return {
            "color_scheme": ["#F5F5F5", "#667EEA", "#764BA2"],
            "furniture": [
                {"item": "Диван угловой", "price": 85000, "description": "Удобный диван в скандинавском стиле"},
                {"item": "Журнальный столик", "price": 25000, "description": "Стеклянный столик с деревянными ножками"},
                {"item": "Стеллаж", "price": 35000, "description": "Модульный стеллаж для книг и декора"}
            ],
            "materials": [
                {"type": "Ламинат", "price_per_sqm": 2500, "description": "Качественное напольное покрытие"},
                {"type": "Краска", "price_per_sqm": 350, "description": "Экологичная краска для стен"},
                {"type": "Плитка", "price_per_sqm": 1800, "description": "Керамическая плитка для ванной"}
            ],
            "total_estimate": 450000,
            "layout_ideas": [
                "Расположите диван у окна для естественного освещения",
                "Создайте зону для работы в углу комнаты",
                "Используйте зеркала для визуального расширения пространства"
            ]
        }

    def _mock_chat_response(self, message: str) -> str:
        """Мок ответы для демо"""
        responses = {
            "планировка": "Для оптимальной планировки рекомендую учесть естественное освещение и функциональные зоны.",
            "мебель": "При выборе мебели ориентируйтесь на размеры комнаты и ваш образ жизни.",
            "цвета": "Используйте правило 60-30-10 для гармонии цветов в интерьере.",
            "бюджет": "Планируйте бюджет с запасом 20-30% на непредвиденные расходы.",
            "освещение": "Сочетайте разные виды освещения: общее, рабочее и декоративное."
        }
        
        message_lower = message.lower()
        for key, response in responses.items():
            if key in message_lower:
                return response
        
        return "Расскажите подробнее о вашем проекте, и я помогу с конкретными рекомендациями."

# Utility functions for external use
async def analyze_room_image(image_data: bytes, filename: str) -> Dict:
    """Быстрый анализ изображения комнаты"""
    service = AIService()
    return await service.analyze_floor_plan(image_data, filename)

async def generate_interior_design(room_type: str, style: str, budget: int = 100000) -> Dict:
    """Быстрая генерация дизайна интерьера"""
    service = AIService()
    return await service.generate_design_suggestions(room_type, style, budget)

async def chat_interior_assistant(message: str, context: Optional[Dict] = None) -> str:
    """Быстрый чат с ИИ помощником"""
    service = AIService()
    return await service.chat_with_ai(message, context)

# Example usage
if __name__ == "__main__":
    print("🤖 RED AI Service - Interior Design Assistant")
    print("=" * 50)
    
    # Test the service
    service = AIService()
    
    # Example: Mock analysis
    print("\n📊 Mock Floor Plan Analysis:")
    analysis = service._mock_analysis()
    print(f"Rooms detected: {analysis['rooms_detected']}")
    print(f"Total area: {analysis['total_area']} sq.m")
    
    # Example: Mock design suggestions
    print("\n🎨 Mock Design Suggestions:")
    suggestions = service._mock_design_suggestions()
    print(f"Color scheme: {suggestions['color_scheme']}")
    print(f"Total estimate: {suggestions['total_estimate']:,} RUB")
    
    print("\n✅ AI Service initialized successfully!")
    print("💡 Ready to assist with interior design projects") 