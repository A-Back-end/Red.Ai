# Обзор системы хранения данных Red.AI

## 📊 Архитектура хранения данных

Проект Red.AI использует многоуровневую архитектуру хранения данных для обеспечения надежности, производительности и масштабируемости.

## 🗄️ Основные типы хранения

### 1. База данных проектов (JSON файл)

**Расположение:** `database/projects.json`

**Описание:** Основное хранилище проектов пользователей в формате JSON.

**Структура данных:**
```json
{
  "id": "project_1753024990755_uum7j34aq",
  "userId": "user_2zYwvV5CzJOaembaK7d8gMPUo64",
  "name": "Название проекта",
  "description": "Описание проекта",
  "imageUrl": "https://...",
  "createdAt": "2025-07-20T15:23:10.755Z",
  "updatedAt": "2025-07-20T15:23:10.755Z",
  "status": "completed",
  "generatedImages": ["https://..."],
  "budget": {
    "min": 25000,
    "max": 37500,
    "currency": "RUB"
  },
  "preferredStyles": ["scandinavian"],
  "restrictions": [],
  "roomAnalysis": null,
  "designRecommendation": null,
  "threeDModel": null,
  "pdfReport": null,
  "shoppingList": null
}
```

**Особенности:**
- Автоматическое резервное копирование (файлы `.backup.*`)
- Простая структура для быстрого доступа
- Подходит для MVP и прототипирования

### 2. PostgreSQL (Production)

**Конфигурация:** `prisma/schema.prisma`

**Описание:** Реляционная база данных для production окружения.

**Структура:**
```sql
-- Пользователи
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Проекты
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Дизайны
CREATE TABLE designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    ai_prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Redis (Кэширование)

**Назначение:** Кэширование, сессии, временные данные

**Конфигурация:**
```yaml
# docker-compose.yml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  command: redis-server --appendonly yes
```

## 📁 Хранение файлов

### 1. Локальное хранение

**Директории:**
- `public/uploads/` - загруженные пользователем изображения
- `public/generated-images/` - сгенерированные AI изображения
- `backend/uploads/` - временные файлы backend
- `backend/generated-images/` - сгенерированные изображения backend

### 2. AWS S3 (Облачное хранение)

**Сервис:** `lib/s3-service.ts`

**Функции:**
- Загрузка изображений в S3 bucket
- Автоматическое скачивание временных URL
- Публичный доступ к файлам
- Метаданные и теги

**Конфигурация:**
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET_NAME=your-bucket-name
```

### 3. Внешние API для изображений

**Сервисы:**
- **BFL.ai** - основной генератор изображений
- **Azure DALL-E** - резервный генератор
- **Hugging Face** - альтернативные модели

## 🔄 Система резервного копирования

### Автоматические бэкапы

**JSON база данных:**
- Автоматическое создание бэкапов при каждом изменении
- Временные метки в именах файлов
- Сохранение истории изменений

**Docker volumes:**
```yaml
volumes:
  postgres_data:    # PostgreSQL данные
  redis_data:       # Redis данные
  backend_uploads:  # Загруженные файлы
```

## 🛠️ API для работы с данными

### Проекты

**Endpoints:**
- `GET /api/projects` - получение проектов пользователя
- `POST /api/projects` - создание нового проекта
- `PUT /api/projects/[id]` - обновление проекта
- `DELETE /api/projects/[id]` - удаление проекта

### Изображения

**Endpoints:**
- `POST /api/upload-image` - загрузка изображения
- `POST /api/save-image` - сохранение изображения в S3/локально
- `GET /api/update-project-images` - анализ временных URL

## 📊 Мониторинг и аналитика

### Логирование

**Файлы логов:**
- `logs/app.log` - общие логи приложения
- `backend/logs/` - логи backend сервисов

### Метрики

**Prometheus конфигурация:**
```yaml
# docker/configs/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'redai-backend'
    static_configs:
      - targets: ['backend:8000']
```

## 🔒 Безопасность

### Аутентификация

**Clerk Integration:**
- JWT токены
- OAuth провайдеры (Google, GitHub)
- Защищенные API endpoints

### Шифрование

**Переменные окружения:**
- Все API ключи в `.env` файлах
- Шифрование паролей (bcrypt)
- HTTPS для production

## 🚀 Развертывание

### Docker Compose

**Сервисы:**
```yaml
services:
  postgres:    # База данных
  redis:       # Кэш
  backend:     # API сервер
  frontend:    # Web приложение
  nginx:       # Reverse proxy
```

### Production

**Облачные провайдеры:**
- **Vercel** - frontend
- **Railway** - backend
- **Supabase** - база данных
- **AWS S3** - файловое хранилище

## 📈 Масштабирование

### Горизонтальное масштабирование

**Стратегии:**
- Load balancing через nginx
- Репликация PostgreSQL
- Redis Cluster для кэша
- CDN для статических файлов

### Вертикальное масштабирование

**Ресурсы:**
- Увеличение CPU/RAM для серверов
- Оптимизация запросов к БД
- Кэширование частых запросов

## 🔧 Утилиты для работы с данными

### Административные инструменты

**Image Manager:** `components/admin/ImageManager.tsx`
- Просмотр всех изображений
- Управление S3 bucket
- Очистка временных файлов

**Database Tools:**
- `scripts/test-projects-api.js` - тестирование API
- `scripts/diagnose-project-save.sh` - диагностика сохранения
- `scripts/fix-redai-issues.sh` - исправление проблем

## 📋 Рекомендации по использованию

### Для разработки

1. **Локальная разработка:**
   ```bash
   # Запуск с JSON базой данных
   npm run dev
   ```

2. **Docker окружение:**
   ```bash
   # Полное окружение с PostgreSQL
   docker-compose up
   ```

### Для production

1. **Настройка S3:**
   - Создать bucket с публичным доступом
   - Настроить CORS политики
   - Включить CloudFront CDN

2. **База данных:**
   - Использовать managed PostgreSQL
   - Настроить автоматические бэкапы
   - Мониторинг производительности

3. **Мониторинг:**
   - Настроить логирование
   - Добавить метрики
   - Настроить алерты

## 🔍 Диагностика проблем

### Частые проблемы

1. **Потеря изображений:**
   ```bash
   # Проверка временных URL
   curl /api/update-project-images
   ```

2. **Проблемы с базой данных:**
   ```bash
   # Тест подключения
   scripts/test-projects-api.js
   ```

3. **S3 проблемы:**
   ```bash
   # Проверка конфигурации
   scripts/test-s3-integration.js
   ```

### Логи и отладка

**Просмотр логов:**
```bash
# Backend логи
tail -f logs/app.log

# Docker логи
docker-compose logs -f backend
```

Этот обзор поможет понять архитектуру хранения данных в Red.AI и эффективно работать с различными типами данных в проекте. 