# Deployment Scripts

Скрипты для деплоя приложения Red.AI на различные платформы.

## Файлы

- **deploy.sh** - Основной скрипт деплоя
- **deploy-server.sh** - Деплой на сервер
- **deploy-server-fix.sh** - Исправление проблем с деплоем сервера
- **deploy-projects-api-fix.sh** - Исправление API проектов

## Использование

```bash
# Основной деплой
./scripts/deployment/deploy.sh

# Деплой на сервер
./scripts/deployment/deploy-server.sh

# Исправление проблем с сервером
./scripts/deployment/deploy-server-fix.sh
```

## Требования

- Настроенные переменные окружения для деплоя
- Доступ к серверу или платформе деплоя
- Необходимые права доступа для деплоя 