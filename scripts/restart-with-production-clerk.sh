#!/bin/bash

# Скрипт для полной очистки кэша и перезапуска с production Clerk ключами

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

echo_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo_step "Полная очистка и перезапуск с production Clerk ключами..."

# 1. Останавливаем все процессы Next.js
echo_step "Остановка процессов Next.js..."
pkill -f "npm run dev" || true
pkill -f "next" || true
pkill -f "node.*next" || true
sleep 2

# 2. Очищаем все кэши
echo_step "Очистка кэшей..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo
rm -rf dist
rm -rf build

# 3. Проверяем .env файлы
echo_step "Проверка .env файлов..."
if [ -f ".env" ]; then
    echo "🔧 .env файл найден"
    if grep -q "pk_live_" .env; then
        echo_success "✅ Production ключи в .env"
    else
        echo_error "❌ Production ключи не найдены в .env"
        exit 1
    fi
else
    echo_error "❌ .env файл не найден"
    exit 1
fi

# 4. Загружаем переменные окружения
echo_step "Загрузка переменных окружения..."
export $(grep -v '^#' .env | xargs)

# Проверяем, что переменная загружена
if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
    echo_error "❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY не загружена"
    exit 1
fi

echo_success "✅ Переменная загружена: ${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:0:20}..."

# 5. Устанавливаем переменную в текущую сессию
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
export CLERK_SECRET_KEY="$CLERK_SECRET_KEY"
export CLERK_TELEMETRY_DISABLED="true"
export NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED="true"

# 6. Переустанавливаем зависимости (опционально)
echo_step "Переустановка зависимостей..."
npm install

# 7. Запускаем приложение
echo_step "Запуск приложения с production ключами..."
echo "🚀 Запускаем: npm run dev"
echo "📋 Переменные окружения:"
echo "   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:0:20}..."
echo "   CLERK_TELEMETRY_DISABLED: $CLERK_TELEMETRY_DISABLED"

# Запускаем в фоне
npm run dev &
DEV_PID=$!

# Ждем запуска
echo_step "Ожидание запуска приложения..."
sleep 10

# Проверяем, что приложение запустилось
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo_success "✅ Приложение запущено на http://localhost:3000"
    
    # Проверяем ключи в HTML
    echo_step "Проверка ключей в HTML..."
    CLERK_KEY_IN_HTML=$(curl -s http://localhost:3000 | grep -o "pk_[a-zA-Z0-9_-]*" | head -1)
    
    if [[ "$CLERK_KEY_IN_HTML" == *"pk_live_"* ]]; then
        echo_success "✅ Production ключи используются в HTML: ${CLERK_KEY_IN_HTML:0:20}..."
    else
        echo_warning "⚠️ В HTML все еще используются старые ключи: $CLERK_KEY_IN_HTML"
        echo "   Это может быть связано с кэшированием браузера"
    fi
    
    echo ""
    echo_success "🎉 Приложение запущено с production Clerk ключами!"
    echo ""
    echo "📋 Проверьте в браузере:"
    echo "   1. Откройте http://localhost:3000"
    echo "   2. Откройте Developer Tools (F12)"
    echo "   3. Проверьте Console на наличие ошибок telemetry"
    echo "   4. Проверьте Network tab на запросы к clerk-telemetry.com"
    echo ""
    echo "🔄 Для остановки приложения:"
    echo "   kill $DEV_PID"
    
else
    echo_error "❌ Приложение не запустилось"
    kill $DEV_PID 2>/dev/null || true
    exit 1
fi 