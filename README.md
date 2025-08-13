#Red.AI - AI-Powered Interior Design Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://python.org)
[![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://docker.com)
[![FastAPI](https://img.shields.io/badge/fastapi-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/next.js-14+-black.svg)](https://nextjs.org)

Red.AI — это современная платформа для генерации дизайна интерьеров с помощью искусственного интеллекта. Создавайте потрясающие интерьеры с помощью DALL-E, GPT и других передовых AI моделей.

## 🔒 Безопасность

**⚠️ Важно:** Все API ключи удалены из этого репозитория для безопасности. 

Для запуска приложения создайте файл `.env.local` с вашими настоящими API ключами:
```bash
cp env.example .env.local
# Отредактируйте .env.local, добавив ваши реальные API ключи
```

## ✨ Особенности

### 🏠 Генерация интерьеров
- **AI-powered дизайн** с Azure DALL-E 3
- **Design Studio** - пошаговый мастер создания дизайна
- **Множество стилей** - от современного до классического
- **Smart Prompts** - автоматическое улучшение описаний
- **Персонализация** под ваши предпочтения и бюджет
- **Высокое качество** изображений (до 1792x1024)

### 🎯 Умный анализ
- **Анализ помещений** по фотографиям
- **Рекомендации мебели** на основе AI
- **Цветовые палитры** от экспертов
- **3D визуализация** интерьеров

### 🚀 Современные технологии
- **Быстрая генерация** благодаря оптимизации
- **Масштабируемость** микросервисной архитектуры
- **Безопасность** с JWT аутентификацией
- **Responsive дизайн** для всех устройств

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   AI Services   │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (OpenAI/HF)   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   File Storage  │    │   PostgreSQL    │    │     Redis       │
│   (Images)      │    │   (Main DB)     │    │   (Cache)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Быстрый старт

### Предварительные требования
- Python 3.11+
- Node.js 18+
- Docker и Docker Compose
- PostgreSQL 15+
- Redis 7+

### 1. Клонирование репозитория
```bash
git clone https://github.com/yourusername/red-ai.git
cd red-ai
```

### 2. Настройка окружения
```bash
# Копирование файла окружения
cp .env.example .env

# Редактирование переменных окружения
nano .env
```

### 3. Запуск через Docker (Рекомендуется)

#### Для разработки:
```bash
# Запуск в режиме разработки
./start-docker-dev.sh

# Или вручную:
docker-compose -f docker-compose.dev.yml up --build -d
```

#### Для продакшена:
```bash
# Запуск в продакшен режиме
./start-docker-prod.sh

# Или вручную:
docker-compose up --build -d
```

#### Остановка:
```bash
# Остановка всех контейнеров
./stop-docker.sh

# Или вручную:
docker-compose down
```

#### Полезные команды:
```bash
# Просмотр логов
docker-compose -f docker-compose.dev.yml logs -f

# Перезапуск сервиса
docker-compose -f docker-compose.dev.yml restart frontend

# Проверка статуса
docker-compose -f docker-compose.dev.yml ps
```

### 4. Запуск для разработки (без Docker)
```bash
# Backend
cd src/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements/dev.txt
uvicorn main:app --reload

# Frontend (в новом терминале)
cd src/frontend
npm install
npm run dev
```

## 🔧 Конфигурация

### Переменные окружения
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/redai
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
HUGGINGFACE_API_KEY=your_hf_key

# Authentication
SECRET_KEY=your_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Storage
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760  # 10MB
```

### Настройка AI сервисов
1. **OpenAI API** - Получите ключ на [platform.openai.com](https://platform.openai.com)
2. **Anthropic Claude** - Зарегистрируйтесь на [console.anthropic.com](https://console.anthropic.com)
3. **Hugging Face** - Создайте токен на [huggingface.co](https://huggingface.co/settings/tokens)

## 🎯 Использование

### ✨ Design Studio (NEW)
Новый интерактивный мастер создания дизайна:

1. **Загрузите изображение** комнаты
2. **Добавьте элементы** (мебель, декор) 
3. **Настройте параметры** (стиль, тип комнаты, бюджет)
4. **Опишите желаемый дизайн** в поле Prompt
5. **Получите результат** от DALL-E 3

```
Доступ: Dashboard → Design Studio
Или: http://localhost:3000/design-studio
```

### 🧪 Тестирование интеграции
🔵 **Azure OpenAI DALL-E 3** (рекомендуется):
```
http://localhost:3000/test-azure-dalle.html
```

OpenAI DALL-E 3 (legacy):
```
http://localhost:3000/test-dalle-integration.html
```

### 1. Регистрация и вход
```bash
# Регистрация нового пользователя
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "name": "John Doe"
  }'
```

### 2. Генерация дизайна с Azure OpenAI DALL-E 3 🔵✨
```bash
# NEW: Генерация с Azure OpenAI DALL-E 3
curl -X POST "http://localhost:3000/api/generate-design" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Modern living room with scandinavian furniture, bright colors",
    "style": "modern",
    "roomType": "living",
    "budgetLevel": "medium",
    "quality": "hd",
    "size": "1024x1024",
    "dalleStyle": "natural"
  }'
```

### 3. Генерация дизайна (Legacy)
```bash
# Генерация дизайна комнаты
curl -X POST "http://localhost:8000/api/v1/ai/generate-design" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "room_type": "living_room",
    "style": "modern",
    "colors": ["white", "grey", "blue"],
    "furniture": ["sofa", "coffee_table", "tv_stand"]
  }'
```

### 4. Анализ помещения
```bash
# Загрузка и анализ изображения комнаты
curl -X POST "http://localhost:8000/api/v1/rooms/analyze" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@room_photo.jpg"
```

## 📊 API Документация

### Основные endpoints
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/login` - Вход в систему
- `GET /api/v1/auth/me` - Информация о пользователе
- `POST /api/generate-design` - **NEW** 🔵 Azure DALL-E 3 генерация дизайна
- `POST /api/dalle-generator` - DALL-E 3 генерация дизайна (legacy)
- `POST /api/v1/ai/generate-design` - Генерация дизайна
- `POST /api/v1/rooms/analyze` - Анализ комнаты
- `GET /api/v1/projects` - Список проектов
- `POST /api/v1/projects` - Создание проекта

### Интерактивная документация
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

## 🧪 Тестирование

### Запуск тестов
```bash
# Backend тесты
cd src/backend
pytest tests/ -v --cov=src

# Frontend тесты
cd src/frontend
npm test

# E2E тесты
npm run test:e2e
```

### Покрытие кода
```bash
# Генерация отчета о покрытии
pytest --cov=src --cov-report=html
open htmlcov/index.html
```

## 🚀 Развертывание

### Production с Docker
```bash
# Сборка production образов
docker-compose -f docker-compose.prod.yml build

# Запуск в production режиме
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes
```bash
# Развертывание в Kubernetes
kubectl apply -f k8s/
```

### CI/CD с GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: ./scripts/deploy.sh
```

## 📁 Структура проекта

```
Red.AI/
├── src/
│   ├── backend/          # FastAPI backend
│   ├── frontend/         # Next.js frontend
│   ├── ai_models/        # AI/ML модели
│   ├── database/         # Database модели
│   └── tests/            # Тесты
├── docker/               # Docker конфигурация
├── docs/                 # Документация
├── scripts/              # Скрипты автоматизации
├── requirements/         # Python зависимости
└── k8s/                  # Kubernetes манифесты
```

## 🤝 Вклад в проект

### Как внести вклад
1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Создайте Pull Request

### Стандарты кода
- **Python**: Black, isort, flake8, mypy
- **JavaScript/TypeScript**: Prettier, ESLint
- **Commits**: Conventional Commits
- **Тесты**: >80% покрытие кода

## 📈 Производительность

### Оптимизации
- **Async/await** для неблокирующих операций
- **Redis кэширование** для быстрых ответов
- **CDN** для статических файлов
- **Connection pooling** для базы данных
- **Image optimization** для UI

### Мониторинг
- **Prometheus** для метрик

- **Sentry** для отслеживания ошибок
- **Logs** структурированное логирование

## 🔒 Безопасность

### Меры безопасности
- **JWT аутентификация** с истечением токенов
- **CORS** настройки для API
- **Rate limiting** для предотвращения атак
- **Input validation** с Pydantic
- **Security headers** через middleware

### Отчет о уязвимостях
Если вы обнаружили уязвимость, отправьте email на security@redai.com

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🙏 Благодарности

- [OpenAI](https://openai.com) за DALL-E и GPT API
- [Anthropic](https://anthropic.com) за Claude API
- [Hugging Face](https://huggingface.co) за открытые модели
- [FastAPI](https://fastapi.tiangolo.com) за отличный фреймворк
- [Next.js](https://nextjs.org) за React фреймворк

## 📞 Поддержка

- 📧 Email: support@redai.com
- 💬 Discord: [Red.AI Community](https://discord.gg/redai)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/red-ai/issues)
- 📖 Docs: [Documentation](https://docs.redai.com)

---


# nfac-red.ai

# red.ai
# Red.Ai
