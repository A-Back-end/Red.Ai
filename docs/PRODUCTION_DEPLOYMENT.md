# 🚀 Production Deployment Guide

## Обзор

Этот документ описывает процесс настройки и деплоя RED.AI в production окружении с использованием Docker и Clerk для аутентификации.

## 🔐 Настройка Clerk Keys

### 1. Получение Production Keys

1. Войдите в [Clerk Dashboard](https://dashboard.clerk.com/)
2. Выберите ваш production проект
3. Перейдите в **API Keys**
4. Скопируйте:
   - **Publishable Key** (начинается с `pk_live_`)
   - **Secret Key** (начинается с `sk_live_`)

### 2. Настройка Environment Variables

Создайте файл `.env.production` в корне проекта:

```bash
# Скопируйте шаблон
cp .env.production.example .env.production

# Отредактируйте файл
nano .env.production
```

**ВАЖНО**: Замените плейсхолдеры на ваши реальные ключи:

```env
# Clerk Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_actual_key_here
CLERK_SECRET_KEY=sk_live_your_actual_secret_here

# Другие переменные...
```

## 🐳 Docker Setup

### 1. Проверка Docker

```bash
# Проверьте версии
docker --version
docker-compose --version

# Убедитесь, что Docker daemon запущен
docker info
```

### 2. Быстрый запуск

Используйте автоматический скрипт:

```bash
# Запустите production setup
./scripts/setup-production.sh
```

### 3. Ручной запуск

```bash
# Остановите существующие контейнеры
docker-compose down --volumes

# Соберите и запустите
docker-compose up --build -d

# Проверьте статус
docker-compose ps
```

## 📁 Структура файлов

```
Red.Ai/
├── .env.production          # Production переменные (НЕ в git!)
├── docker-compose.yml       # Docker Compose конфигурация
├── Dockerfile.frontend      # Frontend Dockerfile
├── scripts/
│   └── setup-production.sh  # Автоматический setup скрипт
└── docs/
    └── PRODUCTION_DEPLOYMENT.md  # Этот файл
```

## 🔧 Конфигурация

### Docker Compose Services

- **frontend**: Next.js приложение (порт 3000)
- **backend**: Python API (порт 8000)
- **postgres**: База данных (порт 5432)
- **redis**: Кэш (порт 6379)
- **nginx**: Reverse proxy (порт 8080)
- **prometheus**: Мониторинг (порт 9090)

### Environment Variables

| Переменная | Описание | Пример |
|------------|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Публичный ключ Clerk | `pk_live_...` |
| `CLERK_SECRET_KEY` | Секретный ключ Clerk | `sk_live_...` |
| `POSTGRES_DB` | Имя базы данных | `redai_production` |
| `OPENAI_API_KEY` | OpenAI API ключ | `sk-...` |

## 🚀 Deployment Commands

### Первый запуск

```bash
# 1. Настройте .env.production
nano .env.production

# 2. Запустите автоматический setup
./scripts/setup-production.sh
```

### Обновление

```bash
# Остановите сервисы
docker-compose down

# Обновите код
git pull origin main

# Пересоберите и запустите
docker-compose up --build -d
```

### Мониторинг

```bash
# Просмотр логов
docker-compose logs -f frontend
docker-compose logs -f backend

# Статус сервисов
docker-compose ps

# Использование ресурсов
docker stats
```

## 🔒 Безопасность

### 1. Файлы .env

- **НЕ коммитьте** `.env.production` в git
- Используйте `.gitignore` для защиты
- Храните ключи в безопасном месте

### 2. Сетевой доступ

- Frontend доступен на `http://localhost:3000`
- Backend API на `http://localhost:8000`
- Настройте firewall для production сервера

### 3. SSL/TLS

Для production используйте SSL:

```bash
# Настройте SSL сертификаты
./scripts/ssl/setup-ssl.sh

# Обновите nginx конфигурацию
docker-compose -f docker-compose.prod.yml up -d
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Clerk Keys не работают

```bash
# Проверьте переменные окружения
docker-compose exec frontend env | grep CLERK

# Перезапустите frontend
docker-compose restart frontend
```

#### 2. Database Connection Error

```bash
# Проверьте статус postgres
docker-compose ps postgres

# Просмотрите логи
docker-compose logs postgres
```

#### 3. Build Failures (npm network errors)

```bash
# Быстрое исправление - очистите Docker cache
docker system prune -a
docker builder prune -a
docker-compose build --no-cache

# Альтернативное решение - используйте pull
docker-compose build --no-cache --pull

# Автоматическое исправление
./scripts/docker-build-fix.sh
```

**📖 Подробное руководство по устранению неполадок**: [Docker Troubleshooting Guide](DOCKER_TROUBLESHOOTING.md)

### Logs Analysis

```bash
# Все логи
docker-compose logs

# Конкретный сервис
docker-compose logs frontend

# Следить за логами в реальном времени
docker-compose logs -f backend
```

## 📊 Monitoring

### Health Checks

Все сервисы имеют health checks:

```bash
# Проверка здоровья
docker-compose ps

# Детальная информация
docker inspect redai_frontend | grep Health -A 10
```

### Prometheus Metrics

- URL: `http://localhost:9090`
- Endpoint: `/metrics`
- Конфигурация: `docker/prometheus.yml`

## 🔄 CI/CD

### GitHub Actions

Создайте `.github/workflows/deploy.yml`:

```yaml
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
        run: |
          # Ваши команды деплоя
```

### Automated Deployment

```bash
# Скрипт для автоматического деплоя
./scripts/deployment/deploy-server-fix.sh
```

## 📞 Support

При возникновении проблем:

1. Проверьте логи: `docker-compose logs`
2. Проверьте статус: `docker-compose ps`
3. Перезапустите: `docker-compose restart`
4. Создайте issue в репозитории

---

**Последнее обновление**: $(date)
**Версия**: 1.0.0
