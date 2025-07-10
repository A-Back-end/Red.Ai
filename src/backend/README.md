# Backend API - Red.AI

## 🚀 Архитектура Backend

FastAPI-based backend для Red.AI платформы дизайна интерьеров.

### 📁 Структура

```
src/backend/
├── api/                    # API endpoints
│   ├── v1/                # Версионирование API
│   │   ├── endpoints/     # Все endpoints
│   │   └── router.py      # Главный роутер
│   └── __init__.py
├── core/                   # Ядро приложения
│   ├── config.py          # Конфигурация
│   ├── database.py        # Подключение к БД
│   ├── exceptions.py      # Обработка ошибок
│   └── middleware.py      # Middleware
├── models/                 # Модели данных
├── schemas/               # Pydantic схемы
├── services/              # Бизнес логика
└── main.py                # Точка входа
```

### 🔧 Основные компоненты

#### API Endpoints
- `/api/v1/auth` - Аутентификация
- `/api/v1/projects` - Управление проектами
- `/api/v1/generate` - Генерация дизайнов
- `/api/v1/analyze` - Анализ помещений
- `/api/v1/export` - Экспорт результатов

#### Сервисы
- **AuthService** - Управление пользователями
- **ProjectService** - Операции с проектами
- **AIService** - Интеграция с AI моделями
- **StorageService** - Управление файлами

### 🛠 Используемые технологии

- **FastAPI** - Веб-фреймворк
- **SQLAlchemy** - ORM
- **Pydantic** - Валидация данных
- **Alembic** - Миграции БД
- **Redis** - Кеширование
- **Celery** - Очереди задач

### 📝 API Documentation

Swagger UI доступен по адресу: `http://localhost:8000/docs`

### 🚀 Запуск

```bash
# Установка зависимостей
pip install -r requirements.txt

# Запуск сервера
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 🔒 Переменные окружения

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/redai

# AI Services
OPENAI_API_KEY=your_openai_key
HUGGING_FACE_API_KEY=your_hf_key

# Storage
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
``` 