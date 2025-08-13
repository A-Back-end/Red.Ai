# Red.AI API Documentation

## 📋 Обзор

Red.AI API предоставляет мощные возможности для генерации и анализа дизайна интерьеров с использованием искусственного интеллекта.

### Базовый URL
```
https://api.red-ai.com/v1
```

### Аутентификация
```http
Authorization: Bearer YOUR_API_KEY
```

## 🔑 Endpoints

### Authentication

#### POST /auth/login
Вход в систему

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST /auth/register
Регистрация нового пользователя

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Projects

#### GET /projects
Получение списка проектов

**Query Parameters:**
- `limit` (int): Количество проектов (по умолчанию 20)
- `offset` (int): Смещение для пагинации
- `status` (string): Фильтр по статусу (draft, in_progress, completed)

**Response:**
```json
{
  "projects": [
    {
      "id": "proj_123",
      "name": "Modern Living Room",
      "description": "Minimalist design with natural elements",
      "status": "in_progress",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-20T15:30:00Z",
      "images_count": 5,
      "tags": ["minimalist", "modern", "living-room"]
    }
  ],
  "total": 1,
  "has_more": false
}
```

#### POST /projects
Создание нового проекта

**Request:**
```json
{
  "name": "My New Project",
  "description": "Project description",
  "tags": ["modern", "bedroom"]
}
```

#### GET /projects/{project_id}
Получение конкретного проекта

#### PUT /projects/{project_id}
Обновление проекта

#### DELETE /projects/{project_id}
Удаление проекта

### Image Generation

#### POST /generate/image
Генерация изображения дизайна

**Request:**
```json
{
  "prompt": "Modern minimalist living room with large windows",
  "style": "photorealistic",
  "quality": "hd",
  "size": "1024x1024",
  "project_id": "proj_123"
}
```

**Response:**
```json
{
  "success": true,
  "image_url": "https://storage.red-ai.com/images/img_123.jpg",
  "image_id": "img_123",
  "metadata": {
    "prompt": "Enhanced prompt used for generation",
    "style": "photorealistic",
    "model": "dall-e-3",
    "generation_time": 8.5
  }
}
```

#### GET /generate/styles
Получение доступных стилей

**Response:**
```json
{
  "styles": [
    {
      "id": "photorealistic",
      "name": "Photorealistic",
      "description": "Realistic interior photos",
      "example_url": "https://example.com/style1.jpg"
    },
    {
      "id": "minimalist",
      "name": "Minimalist",
      "description": "Clean, simple design",
      "example_url": "https://example.com/style2.jpg"
    }
  ]
}
```

### Room Analysis

#### POST /analyze/room
Анализ изображения комнаты

**Request:**
```json
{
  "image_url": "https://example.com/room.jpg",
  "analyze_type": "full"
}
```

**Response:**
```json
{
  "analysis": {
    "room_type": "living_room",
    "style": "modern",
    "colors": ["#FFFFFF", "#808080", "#000000"],
    "furniture": [
      {
        "type": "sofa",
        "color": "gray",
        "style": "modern"
      }
    ],
    "suggestions": [
      "Add plants for natural elements",
      "Consider warmer lighting"
    ]
  }
}
```

### Chat Interface

#### POST /chat/message
Отправка сообщения в чат

**Request:**
```json
{
  "message": "I want to design a modern bedroom",
  "context": {
    "project_id": "proj_123",
    "previous_messages": []
  }
}
```

**Response:**
```json
{
  "response": "I'd be happy to help you design a modern bedroom! Let's start with the color scheme...",
  "suggestions": [
    "Upload a photo of your current bedroom",
    "Tell me about your preferred colors",
    "What's your budget range?"
  ],
  "message_id": "msg_123"
}
```

### File Management

#### POST /upload/image
Загрузка изображения

**Request:**
```
Content-Type: multipart/form-data

file: [image file]
project_id: proj_123
```

**Response:**
```json
{
  "success": true,
  "file_id": "file_123",
  "file_url": "https://storage.red-ai.com/uploads/file_123.jpg",
  "metadata": {
    "size": 1024576,
    "format": "jpeg",
    "dimensions": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

#### GET /files/{file_id}
Получение информации о файле

#### DELETE /files/{file_id}
Удаление файла

## 📊 Response Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 422  | Validation Error |
| 429  | Rate Limited |
| 500  | Internal Server Error |

## 🚦 Rate Limiting

API имеет следующие ограничения:

- **Базовый тариф**: 100 запросов в минуту
- **Премиум тариф**: 1000 запросов в минуту
- **Генерация изображений**: 10 запросов в минуту

Headers для rate limiting:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔧 Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "prompt",
      "issue": "Prompt is required"
    }
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Некорректные данные
- `AUTHENTICATION_ERROR`: Проблемы с аутентификацией
- `RATE_LIMIT_ERROR`: Превышен лимит запросов
- `QUOTA_EXCEEDED`: Исчерпана квота
- `AI_SERVICE_ERROR`: Ошибка AI сервиса

## 📝 Examples

### Python SDK Example
```python
import redai

client = redai.Client(api_key="your_api_key")

# Генерация изображения
response = client.generate_image(
    prompt="Modern kitchen with island",
    style="photorealistic",
    quality="hd"
)

print(response.image_url)
```

### JavaScript SDK Example
```javascript
const RedAI = require('red-ai');

const client = new RedAI({ apiKey: 'your_api_key' });

// Генерация изображения
const response = await client.generateImage({
  prompt: 'Modern kitchen with island',
  style: 'photorealistic',
  quality: 'hd'
});

console.log(response.imageUrl);
```

### cURL Example
```bash
curl -X POST "https://api.red-ai.com/v1/generate/image" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Modern kitchen with island",
    "style": "photorealistic",
    "quality": "hd"
  }'
```

## 🔗 Webhooks

### Настройка webhooks
```json
{
  "url": "https://your-app.com/webhooks/redai",
  "events": ["image.generated", "project.completed"],
  "secret": "your_webhook_secret"
}
```

### Webhook Events
- `image.generated`: Изображение сгенерировано
- `project.completed`: Проект завершен
- `analysis.completed`: Анализ завершен

## 📚 SDKs

Официальные SDK доступны для:
- Python: `pip install red-ai`
- JavaScript/Node.js: `npm install red-ai`
- Ruby: `gem install red-ai`
- PHP: `composer require red-ai/php-sdk`

## 🆘 Support

- **Documentation**: https://docs.red-ai.com
- **Support**: support@red-ai.com
- **Status Page**: https://status.red-ai.com
- **GitHub**: https://github.com/red-ai/api

## 📜 Changelog

### v1.0.0 (2024-01-01)
- Initial API release
- Basic image generation
- Project management
- Chat interface

### v1.1.0 (2024-01-15)
- Added room analysis
- Improved error handling
- New styles support

---

*Last updated: January 2024* 