#!/bin/bash

# ========================================
# DOCKER FIXED TEST SCRIPT
# ========================================
# Тестируем исправленную Docker сборку

set -e

echo "🔧 Тестируем исправленную Docker сборку..."

# Проверяем Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен!"
    exit 1
fi

echo "✅ Docker найден: $(docker --version)"

# Очищаем старые контейнеры и образы
echo "🧹 Очищаем старые контейнеры..."
docker-compose -f docker-compose.test.yml down --volumes --remove-orphans 2>/dev/null || true

echo "🧹 Очищаем Docker cache..."
docker system prune -f

# Проверяем .env.production
if [ ! -f .env.production ]; then
    echo "⚠️  .env.production не найден, создаем минимальный..."
    cat > .env.production << 'EOF'
# Minimal production environment
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_placeholder
CLERK_SECRET_KEY=sk_test_placeholder
NODE_ENV=production
EOF
fi

echo "✅ Environment файл готов"

# Тестируем сборку только frontend
echo "🔨 Тестируем сборку frontend..."
if docker build -f Dockerfile.frontend .; then
    echo "✅ Frontend сборка успешна!"
else
    echo "❌ Frontend сборка не удалась"
    exit 1
fi

# Тестируем простой docker-compose
echo "🚀 Запускаем тестовый docker-compose..."
if docker-compose -f docker-compose.test.yml up --build -d; then
    echo "✅ Docker Compose запущен успешно!"
    
    # Ждем запуска
    echo "⏳ Ждем запуска сервисов..."
    sleep 30
    
    # Проверяем статус
    echo "🔍 Проверяем статус..."
    docker-compose -f docker-compose.test.yml ps
    
    # Проверяем логи
    echo "📋 Логи frontend:"
    docker-compose -f docker-compose.test.yml logs frontend --tail=20
    
    echo ""
    echo "🎉 Тест завершен успешно!"
    echo "📱 Frontend доступен на: http://localhost:3000"
    echo ""
    echo "📋 Команды управления:"
    echo "  - Остановить: docker-compose -f docker-compose.test.yml down"
    echo "  - Логи: docker-compose -f docker-compose.test.yml logs -f"
    echo "  - Перезапустить: docker-compose -f docker-compose.test.yml restart"
    
else
    echo "❌ Docker Compose не удался"
    echo "📋 Логи ошибок:"
    docker-compose -f docker-compose.test.yml logs
    exit 1
fi
