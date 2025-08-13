#!/bin/bash

# Финальный скрипт для полного исправления проблемы с development ключами

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

echo_step "Финальное исправление проблемы с development ключами..."

# 1. Останавливаем все процессы
echo_step "Остановка всех процессов Next.js..."
pkill -f "npm run dev" || true
pkill -f "next" || true
pkill -f "node.*next" || true
sleep 3

# 2. Проверяем, что порты свободны
echo_step "Проверка портов..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo_warning "Порт 3000 все еще занят, останавливаем..."
    lsof -ti:3000 | xargs kill -9
fi

if lsof -ti:3001 > /dev/null 2>&1; then
    echo_warning "Порт 3001 все еще занят, останавливаем..."
    lsof -ti:3001 | xargs kill -9
fi

sleep 2

# 3. Очищаем все кэши
echo_step "Полная очистка кэшей..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo
rm -rf dist
rm -rf build

# 4. Проверяем .env файлы
echo_step "Проверка .env файлов..."
echo ""

# Проверяем .env
if [ -f ".env" ]; then
    echo "🔧 .env:"
    if grep -q "pk_live_" .env; then
        echo_success "  ✅ Production ключи"
        grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env
    else
        echo_error "  ❌ Development ключи"
        exit 1
    fi
else
    echo_error "❌ .env файл не найден"
    exit 1
fi

# Проверяем .env.local
if [ -f ".env.local" ]; then
    echo "🔧 .env.local:"
    if grep -q "pk_live_" .env.local; then
        echo_success "  ✅ Production ключи"
        grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.local
    else
        echo_error "  ❌ Development ключи"
        exit 1
    fi
else
    echo_error "❌ .env.local файл не найден"
    exit 1
fi

echo ""

# 5. Загружаем переменные окружения
echo_step "Загрузка переменных окружения..."
export $(grep -v '^#' .env | xargs)

# Проверяем загрузку
if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
    echo_error "❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY не загружена"
    exit 1
fi

echo_success "✅ Переменная загружена: ${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:0:20}..."

# 6. Проверяем, что это production ключ
if [[ "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" == *"pk_live_"* ]]; then
    echo_success "✅ Используется production ключ"
else
    echo_error "❌ Используется development ключ"
    exit 1
fi

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
sleep 15

# Проверяем, что приложение запустилось
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo_success "✅ Приложение запущено на http://localhost:3000"
    
    # Проверяем ключи в HTML
    echo_step "Проверка ключей в HTML..."
    CLERK_KEY_IN_HTML=$(curl -s http://localhost:3000 | grep -o "pk_[a-zA-Z0-9_-]*" | head -1)
    
    if [[ "$CLERK_KEY_IN_HTML" == *"pk_live_"* ]]; then
        echo_success "✅ Production ключи используются в HTML: ${CLERK_KEY_IN_HTML:0:20}..."
    else
        echo_error "❌ В HTML используются development ключи: $CLERK_KEY_IN_HTML"
        kill $DEV_PID 2>/dev/null || true
        exit 1
    fi
    
    # Проверяем telemetry
    echo_step "Проверка отключения telemetry..."
    if curl -s http://localhost:3000 | grep -q '"telemetry":false'; then
        echo_success "✅ Telemetry отключен"
    else
        echo_warning "⚠️ Telemetry не найден в HTML"
    fi
    
    echo ""
    echo_success "🎉 Приложение запущено с production Clerk ключами!"
    echo ""
    echo "📋 Инструкции для проверки в браузере:"
    echo "   1. Откройте http://localhost:3000"
    echo "   2. Очистите кэш браузера (Ctrl+Shift+R или Cmd+Shift+R)"
    echo "   3. Откройте Developer Tools (F12)"
    echo "   4. Перейдите на вкладку Console"
    echo "   5. Проверьте, что НЕТ предупреждения о development ключах"
    echo "   6. Проверьте Network tab на отсутствие запросов к clerk-telemetry.com"
    echo ""
    echo "🔄 Для остановки приложения:"
    echo "   kill $DEV_PID"
    
else
    echo_error "❌ Приложение не запустилось"
    kill $DEV_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo_warning "💡 Если в браузере все еще показывается предупреждение:"
echo "   1. Очистите кэш браузера полностью"
echo "   2. Закройте и откройте браузер заново"
echo "   3. Проверьте в режиме инкогнито"
echo "   4. Убедитесь, что открываете http://localhost:3000 (не 3001)" 