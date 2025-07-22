# Docker Setup для Red.AI

## 🐳 Обзор

Red.AI полностью настроен для работы через Docker, что обеспечивает:
- **Консистентность окружения** между разработкой и продакшеном
- **Простота развертывания** на любом сервере
- **Изоляция зависимостей** для каждого сервиса
- **Масштабируемость** микросервисной архитектуры

## 📋 Предварительные требования

### Установка Docker
```bash
# macOS (через Homebrew)
brew install --cask docker

# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# CentOS/RHEL
sudo yum install docker docker-compose

# Windows
# Скачайте Docker Desktop с официального сайта
```

### Проверка установки
```bash
docker --version
docker-compose --version
```

## 🚀 Быстрый старт

### 1. Клонирование и настройка
```bash
git clone <repository-url>
cd Red.Ai

# Создание файла окружения
cp .env.example .env.local
# Отредактируйте .env.local с вашими API ключами
```

### 2. Запуск в режиме разработки
```bash
# Автоматический запуск
./start-docker-dev.sh

# Или вручную
docker-compose -f docker-compose.dev.yml up --build -d
```

### 3. Проверка работы
```bash
# Статус контейнеров
docker-compose -f docker-compose.dev.yml ps

# Доступные сервисы:
# 🌐 Frontend: http://localhost:3000
# 🔧 Backend: http://localhost:8000
# 🗄️  PostgreSQL: localhost:5432
# 📦 Redis: localhost:6379
```

## 🏗️ Архитектура Docker

### Сервисы в docker-compose.dev.yml

#### Frontend (Next.js)
- **Порт**: 3000
- **Образ**: redai-frontend
- **Volumes**: ./app, ./components, ./lib, ./public, ./utils, ./services, ./pages
- **Переменные**: NEXT_PUBLIC_*, OPENAI_API_KEY, BFL_API_KEY, AZURE_*

#### Backend (FastAPI)
- **Порт**: 8000
- **Образ**: redai-backend
- **Volumes**: ./backend, ./src, ./uploads, ./logs
- **Переменные**: DATABASE_URL, REDIS_URL, OPENAI_API_KEY, BFL_API_KEY, AZURE_*

#### AI Processor
- **Образ**: redai-ai-processor
- **Volumes**: ./src/ai_models, ./backend, ./uploads
- **Переменные**: REDIS_URL, OPENAI_API_KEY, BFL_API_KEY, AZURE_*

#### PostgreSQL
- **Порт**: 5432
- **Образ**: postgres:15-alpine
- **Volume**: postgres_data_dev
- **Переменные**: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD

#### Redis
- **Порт**: 6379
- **Образ**: redis:7-alpine
- **Volume**: redis_data_dev

## 📁 Структура Docker файлов

```
docker/
├── Dockerfile.backend          # Backend контейнер
├── Dockerfile.frontend         # Frontend контейнер
├── Dockerfile.ai-processor     # AI Processor контейнер
├── nginx.conf                  # Nginx конфигурация
└── prometheus.yml              # Prometheus конфигурация

docker-compose.yml              # Продакшен конфигурация
docker-compose.dev.yml          # Разработка конфигурация
docker-compose.simple.yml       # Упрощенная конфигурация
```

## 🔧 Управление контейнерами

### Основные команды

#### Запуск
```bash
# Разработка
./start-docker-dev.sh

# Продакшен
./start-docker-prod.sh

# Ручной запуск
docker-compose -f docker-compose.dev.yml up -d
```

#### Остановка
```bash
# Остановка всех контейнеров
./stop-docker.sh

# Ручная остановка
docker-compose -f docker-compose.dev.yml down
```

#### Перезапуск
```bash
# Перезапуск всех сервисов
docker-compose -f docker-compose.dev.yml restart

# Перезапуск конкретного сервиса
docker-compose -f docker-compose.dev.yml restart frontend
```

#### Логи
```bash
# Все логи
docker-compose -f docker-compose.dev.yml logs

# Логи конкретного сервиса
docker-compose -f docker-compose.dev.yml logs frontend

# Логи в реальном времени
docker-compose -f docker-compose.dev.yml logs -f
```

#### Статус
```bash
# Статус контейнеров
docker-compose -f docker-compose.dev.yml ps

# Детальная информация
docker-compose -f docker-compose.dev.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

## 🔍 Отладка

### Проблемы с запуском

#### 1. Порт уже занят
```bash
# Проверка занятых портов
lsof -i :3000
lsof -i :8000

# Остановка процессов
sudo kill -9 <PID>
```

#### 2. Проблемы с образами
```bash
# Пересборка образов
docker-compose -f docker-compose.dev.yml build --no-cache

# Удаление всех образов
docker-compose -f docker-compose.dev.yml down --rmi all
```

#### 3. Проблемы с volumes
```bash
# Удаление volumes
docker-compose -f docker-compose.dev.yml down -v

# Очистка Docker
docker system prune -a
```

### Просмотр логов ошибок
```bash
# Логи с ошибками
docker-compose -f docker-compose.dev.yml logs --tail=100

# Логи конкретного сервиса
docker-compose -f docker-compose.dev.yml logs backend --tail=50
```

## 🔐 Переменные окружения

### Обязательные переменные в .env.local
```env
# OpenAI
OPENAI_API_KEY=your_openai_key

# BFL.ai
BFL_API_KEY=your_bfl_key

# Azure OpenAI (опционально)
AZURE_OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=your_azure_endpoint

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key

# Database
POSTGRES_DB=redai_dev
POSTGRES_USER=redai_user
POSTGRES_PASSWORD=redai_password
```

### Передача переменных в контейнеры
Все переменные из `.env.local` автоматически передаются в контейнеры через:
```yaml
environment:
  - BFL_API_KEY=${BFL_API_KEY:-}
  - OPENAI_API_KEY=${OPENAI_API_KEY:-}
```

## 🚀 Продакшен развертывание

### 1. Подготовка сервера
```bash
# Установка Docker на сервер
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установка docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Развертывание
```bash
# Клонирование проекта
git clone <repository-url>
cd Red.Ai

# Настройка переменных окружения
cp .env.example .env.local
nano .env.local

# Запуск в продакшен режиме
./start-docker-prod.sh
```

### 3. Мониторинг
```bash
# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Мониторинг ресурсов
docker stats
```

## 📊 Мониторинг и логи

### Prometheus (только в продакшене)
- **URL**: http://localhost:9090
- **Конфигурация**: docker/prometheus.yml
- **Метрики**: CPU, Memory, Network, Custom metrics

### Логи контейнеров
```bash
# Все логи
docker-compose logs

# Логи с временными метками
docker-compose logs -t

# Логи последних 100 строк
docker-compose logs --tail=100
```

## 🔄 CI/CD интеграция

### GitHub Actions пример
```yaml
name: Deploy to Server
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          ssh user@server "cd /path/to/redai && git pull && ./start-docker-prod.sh"
```

## 📝 Полезные команды

### Разработка
```bash
# Быстрый перезапуск frontend
docker-compose -f docker-compose.dev.yml restart frontend

# Просмотр логов в реальном времени
docker-compose -f docker-compose.dev.yml logs -f frontend

# Вход в контейнер
docker-compose -f docker-compose.dev.yml exec frontend sh
```

### Продакшен
```bash
# Обновление без простоя
docker-compose pull && docker-compose up -d

# Резервное копирование базы данных
docker-compose exec postgres pg_dump -U redai_user redai > backup.sql

# Восстановление базы данных
docker-compose exec -T postgres psql -U redai_user redai < backup.sql
```

## ✅ Проверка работоспособности

### Тест API
```bash
# Тест генерации дизайна
curl -X POST http://localhost:3000/api/generate-design \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "style": "modern", "roomType": "living-room"}'

# Тест проверки статуса
curl "http://localhost:3000/api/check-status?url=YOUR_POLLING_URL"
```

### Тест фронтенда
```bash
# Проверка доступности
curl -I http://localhost:3000

# Проверка health check
curl http://localhost:3000/api/health
```

## 🎯 Результат

✅ **Docker полностью настроен** для разработки и продакшена  
✅ **BFL API работает** через Docker контейнеры  
✅ **Все сервисы изолированы** и масштабируемы  
✅ **Простое развертывание** на любой сервер  
✅ **Консистентное окружение** между локальной разработкой и продакшеном 