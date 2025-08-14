#!/bin/bash

# ========================================
# RED.AI PRODUCTION SETUP SCRIPT
# ========================================
# Скрипт для быстрой настройки production окружения

set -e

echo "🚀 Настройка RED.AI для production..."

# Проверяем наличие .env.production
if [ ! -f .env.production ]; then
    echo "❌ Файл .env.production не найден!"
    echo "Создайте его на основе .env.production.example"
    exit 1
fi

# Проверяем наличие Clerk ключей
if grep -q "pk_live_your_publishable_key_here" .env.production; then
    echo "⚠️  ВНИМАНИЕ: Clerk ключи не настроены!"
    echo "Отредактируйте .env.production и добавьте ваши боевые ключи:"
    echo "  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_..."
    echo "  - CLERK_SECRET_KEY=sk_live_..."
    echo ""
    read -p "Продолжить без настройки ключей? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Проверяем Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose не установлен!"
    exit 1
fi

echo "✅ Docker и Docker Compose найдены"

# Останавливаем существующие контейнеры
echo "🛑 Останавливаем существующие контейнеры..."
docker-compose down --volumes --remove-orphans

# Очищаем старые образы
echo "🧹 Очищаем старые образы..."
docker system prune -f

# Собираем и запускаем
echo "🔨 Собираем и запускаем production окружение..."
docker-compose up --build -d

# Ждем запуска сервисов
echo "⏳ Ждем запуска сервисов..."
sleep 30

# Проверяем статус
echo "🔍 Проверяем статус сервисов..."
docker-compose ps

echo ""
echo "🎉 Production окружение запущено!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "🗄️  Database: localhost:5432"
echo "📊 Monitoring: http://localhost:9090"
echo ""
echo "📋 Полезные команды:"
echo "  - Просмотр логов: docker-compose logs -f"
echo "  - Остановка: docker-compose down"
echo "  - Перезапуск: docker-compose restart"
echo "  - Обновление: docker-compose pull && docker-compose up -d"
