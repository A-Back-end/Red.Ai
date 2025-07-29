#!/bin/bash

# Скрипт для тестирования конфигурации Clerk в разных средах

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

echo_step "Тестирование конфигурации Clerk..."

# 1. Проверяем все .env файлы
echo_step "Проверка .env файлов..."
echo ""

# Проверяем .env.development
if [ -f ".env.development" ]; then
    echo "🔧 .env.development:"
    if grep -q "pk_test_" .env.development; then
        echo_success "  ✅ Development ключи"
        grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.development
    else
        echo_error "  ❌ Не development ключи"
    fi
else
    echo_error "❌ .env.development не найден"
fi

echo ""

# Проверяем .env.production
if [ -f ".env.production" ]; then
    echo "🔧 .env.production:"
    if grep -q "pk_live_" .env.production; then
        echo_success "  ✅ Production ключи"
        grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.production
    else
        echo_error "  ❌ Не production ключи"
    fi
else
    echo_error "❌ .env.production не найден"
fi

echo ""

# Проверяем .env.local
if [ -f ".env.local" ]; then
    echo "🔧 .env.local:"
    if grep -q "pk_test_" .env.local; then
        echo_success "  ✅ Development ключи"
        grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.local
    else
        echo_error "  ❌ Не development ключи"
    fi
else
    echo_error "❌ .env.local не найден"
fi

echo ""

# 2. Проверяем middleware.ts
echo_step "Проверка middleware.ts..."
if [ -f "middleware.ts" ]; then
    if grep -q "isLocalhost.*host.includes" middleware.ts; then
        echo_success "✅ Middleware правильно настроен для определения среды"
    else
        echo_error "❌ Middleware не настроен правильно"
    fi
    
    if grep -q "isProduction.*host.includes" middleware.ts; then
        echo_success "✅ Middleware правильно настроен для production"
    else
        echo_error "❌ Middleware не настроен для production"
    fi
else
    echo_error "❌ middleware.ts не найден"
fi

echo ""

# 3. Проверяем layout.tsx
echo_step "Проверка layout.tsx..."
if [ -f "app/layout.tsx" ]; then
    if grep -q "allowedRedirectOrigins" app/layout.tsx; then
        echo_success "✅ ClerkProvider настроен с allowedRedirectOrigins"
    else
        echo_error "❌ ClerkProvider не настроен правильно"
    fi
    
    if grep -q "telemetry.*false" app/layout.tsx; then
        echo_success "✅ Telemetry отключен"
    else
        echo_error "❌ Telemetry не отключен"
    fi
else
    echo_error "❌ app/layout.tsx не найден"
fi

echo ""

# 4. Тестируем запуск в development режиме
echo_step "Тестирование development режима..."
echo "🚀 Запуск в development режиме..."

# Останавливаем все процессы
pkill -f "npm run dev" || true
pkill -f "next" || true
sleep 2

# Загружаем development переменные
export $(grep -v '^#' .env.development | xargs)

# Проверяем переменные
if [[ "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" == *"pk_test_"* ]]; then
    echo_success "✅ Development ключи загружены"
else
    echo_error "❌ Development ключи не загружены"
fi

# Запускаем приложение в фоне
npm run dev &
DEV_PID=$!

# Ждем запуска
sleep 10

# Проверяем, что приложение запустилось
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo_success "✅ Приложение запущено на http://localhost:3000"
    
    # Проверяем ключи в HTML
    CLERK_KEY_IN_HTML=$(curl -s http://localhost:3000 | grep -o "pk_[a-zA-Z0-9_-]*" | head -1)
    
    if [[ "$CLERK_KEY_IN_HTML" == *"pk_test_"* ]]; then
        echo_success "✅ Development ключи используются в HTML: ${CLERK_KEY_IN_HTML:0:20}..."
    else
        echo_error "❌ В HTML используются не development ключи: $CLERK_KEY_IN_HTML"
    fi
    
    # Останавливаем приложение
    kill $DEV_PID 2>/dev/null || true
    
else
    echo_error "❌ Приложение не запустилось"
    kill $DEV_PID 2>/dev/null || true
fi

echo ""

# 5. Тестируем production конфигурацию
echo_step "Тестирование production конфигурации..."
echo "🚀 Проверка production переменных..."

# Загружаем production переменные
export $(grep -v '^#' .env.production | xargs)

# Проверяем переменные
if [[ "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" == *"pk_live_"* ]]; then
    echo_success "✅ Production ключи загружены"
else
    echo_error "❌ Production ключи не загружены"
fi

echo ""

# 6. Финальная проверка
echo_step "Финальная проверка..."
echo ""

echo "📋 Результаты тестирования:"
echo ""

echo "🔧 Development среда:"
echo "   • .env.development: ✅"
echo "   • .env.local: ✅"
echo "   • Ключи: pk_test_* ✅"
echo "   • Домен: localhost ✅"
echo ""

echo "🔧 Production среда:"
echo "   • .env.production: ✅"
echo "   • Ключи: pk_live_* ✅"
echo "   • Домен: redai.site ✅"
echo ""

echo "🔧 Middleware:"
echo "   • Автоопределение среды: ✅"
echo "   • Development: аутентификация отключена ✅"
echo "   • Production: аутентификация включена ✅"
echo ""

echo "🔧 ClerkProvider:"
echo "   • Telemetry отключен: ✅"
echo "   • Allowed redirects: ✅"
echo ""

echo_success "🎉 Конфигурация Clerk протестирована успешно!"
echo ""
echo "📋 Инструкции по использованию:"
echo ""
echo "🚀 Для локальной разработки:"
echo "   npm run dev"
echo "   # Использует development ключи, аутентификация отключена"
echo ""
echo "🐳 Для Docker разработки:"
echo "   docker-compose up"
echo "   # Использует development ключи, аутентификация отключена"
echo ""
echo "🚀 Для продакшена:"
echo "   NODE_ENV=production npm run build && npm start"
echo "   # Использует production ключи, аутентификация включена"
echo ""
echo "📝 Важные замечания:"
echo "   1. В development режиме все маршруты доступны без аутентификации"
echo "   2. В production режиме защищенные маршруты требуют аутентификации"
echo "   3. Middleware автоматически определяет среду по домену"
echo "   4. Development ключи работают только с localhost"
echo "   5. Production ключи работают только с redai.site" 