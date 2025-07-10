# AI Models - Red.AI

## 🤖 Архитектура AI моделей

Интеграция с различными AI сервисами для генерации и анализа дизайнов.

### 📁 Структура

```
src/ai_models/
├── image_generation/      # Генерация изображений
│   ├── dalle_service.py   # OpenAI DALL-E
│   ├── flux_service.py    # Flux модель
│   └── huggingface_service.py # HF Diffusion
├── text_generation/       # Генерация текста
│   ├── openai_service.py  # GPT-4
│   └── claude_service.py  # Claude
├── image_analysis/        # Анализ изображений
│   ├── vision_service.py  # OpenAI Vision
│   └── room_analyzer.py   # Анализ помещений
├── embeddings/           # Векторные представления
│   └── text_embeddings.py # Текстовые эмбеддинги
└── prompts/              # Промпты и шаблоны
    ├── design_prompts.py  # Промпты для дизайна
    └── chat_prompts.py    # Промпты для чата
```

### 🎯 Основные сервисы

#### Генерация изображений
- **DALLEService** - OpenAI DALL-E 3
- **FluxService** - Flux модель
- **HuggingFaceService** - Fallback сервис

#### Анализ изображений
- **VisionService** - Анализ изображений
- **RoomAnalyzer** - Анализ помещений
- **StyleDetector** - Определение стиля

#### Текстовая генерация
- **OpenAIService** - GPT-4 для чата
- **ClaudeService** - Claude для сложных задач

### 🔧 Конфигурация

```python
# AI Services Configuration
AI_SERVICES = {
    "image_generation": {
        "primary": "dalle",
        "fallback": "huggingface"
    },
    "text_generation": {
        "primary": "openai",
        "fallback": "claude"
    }
}
```

### 🚀 Использование

```python
from ai_models.image_generation import DALLEService
from ai_models.text_generation import OpenAIService

# Генерация изображения
dalle = DALLEService()
image = await dalle.generate_image(
    prompt="modern living room with minimalist design",
    style="photorealistic"
)

# Текстовая генерация
openai = OpenAIService()
response = await openai.generate_response(
    prompt="Suggest color scheme for bedroom",
    context="user prefers warm tones"
)
```

### 📊 Модели

#### Поддерживаемые модели:
- **DALL-E 3** - Высококачественная генерация
- **Flux** - Быстрая генерация
- **Stable Diffusion** - Открытая модель
- **GPT-4** - Текстовая генерация
- **Claude** - Сложные задачи

### 🔒 Безопасность

- Фильтрация контента
- Ограничения на запросы
- Валидация промптов
- Мониторинг использования 