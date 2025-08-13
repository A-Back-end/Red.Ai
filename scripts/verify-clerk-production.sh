#!/bin/bash

# Скрипт для проверки и очистки кэша после переключения Clerk на production mode

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

echo_step "Проверка конфигурации Clerk production mode..."

# 1. Проверяем все .env файлы
echo_step "Проверка .env файлов..."

echo ""
echo "📋 Проверка Clerk ключей в .env файлах:"
echo ""

# Проверяем .env
if [ -f ".env" ]; then
    echo "🔧 .env файл:"
    if grep -q "pk_live_" .env; then
        echo_success "  ✅ Используется production ключ"
        grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env
    else
        echo_error "  ❌ Не найден production ключ"
    fi
    
    if grep -q "CLERK_TELEMETRY_DISABLED=true" .env; then
        echo_success "  ✅ Telemetry отключен"
    else
        echo_warning "  ⚠️ Telemetry не отключен"
    fi
    echo ""
fi

# Проверяем .env.local
if [ -f ".env.local" ]; then
    echo "🔧 .env.local файл:"
    if grep -q "pk_live_" .env.local; then
        echo_success "  ✅ Используется production ключ"
        grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.local
    else
        echo_error "  ❌ Не найден production ключ"
    fi
    
    if grep -q "CLERK_TELEMETRY_DISABLED=true" .env.local; then
        echo_success "  ✅ Telemetry отключен"
    else
        echo_warning "  ⚠️ Telemetry не отключен"
    fi
    echo ""
fi

# Проверяем .env.production
if [ -f ".env.production" ]; then
    echo "🔧 .env.production файл:"
    if grep -q "pk_live_" .env.production; then
        echo_success "  ✅ Используется production ключ"
        grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.production
    else
        echo_error "  ❌ Не найден production ключ"
    fi
    
    if grep -q "CLERK_TELEMETRY_DISABLED=true" .env.production; then
        echo_success "  ✅ Telemetry отключен"
    else
        echo_warning "  ⚠️ Telemetry не отключен"
    fi
    echo ""
fi

# 2. Проверяем layout.tsx
echo_step "Проверка layout.tsx..."
if grep -q "telemetry={false}" app/layout.tsx; then
    echo_success "✅ Telemetry отключен в ClerkProvider"
else
    echo_error "❌ Telemetry не отключен в ClerkProvider"
fi

# 3. Очищаем кэш
echo_step "Очистка кэша..."
echo "🧹 Очистка Next.js кэша..."

# Удаляем .next папку
if [ -d ".next" ]; then
    rm -rf .next
    echo_success "✅ .next папка удалена"
else
    echo_warning "⚠️ .next папка не найдена"
fi

# Очищаем node_modules/.cache если есть
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo_success "✅ node_modules/.cache очищен"
fi

# 4. Проверяем, что нет development ключей
echo_step "Проверка на наличие development ключей..."
if grep -r "pk_test_" .env* 2>/dev/null; then
    echo_warning "⚠️ Найдены test ключи в .env файлах"
else
    echo_success "✅ Test ключи не найдены"
fi

# 5. Проверяем Docker конфигурации
echo_step "Проверка Docker конфигураций..."
echo "🐳 Проверка docker-compose файлов:"

if grep -q "pk_live_" docker-compose.production.yml; then
    echo_success "  ✅ docker-compose.production.yml использует production ключи"
else
    echo_warning "  ⚠️ docker-compose.production.yml не использует production ключи"
fi

# 6. Финальная проверка
echo_step "Финальная проверка..."
echo ""
echo "🎯 Результат проверки:"
echo ""

# Проверяем все ключи
TOTAL_FILES=0
PRODUCTION_FILES=0
TELEMETRY_DISABLED_FILES=0

for env_file in .env .env.local .env.production; do
    if [ -f "$env_file" ]; then
        TOTAL_FILES=$((TOTAL_FILES + 1))
        
        if grep -q "pk_live_" "$env_file"; then
            PRODUCTION_FILES=$((PRODUCTION_FILES + 1))
        fi
        
        if grep -q "CLERK_TELEMETRY_DISABLED=true" "$env_file"; then
            TELEMETRY_DISABLED_FILES=$((TELEMETRY_DISABLED_FILES + 1))
        fi
    fi
done

echo "📊 Статистика:"
echo "  • Всего .env файлов: $TOTAL_FILES"
echo "  • С production ключами: $PRODUCTION_FILES"
echo "  • С отключенным telemetry: $TELEMETRY_DISABLED_FILES"

if [ $PRODUCTION_FILES -eq $TOTAL_FILES ] && [ $TELEMETRY_DISABLED_FILES -eq $TOTAL_FILES ]; then
    echo_success "🎉 Все файлы настроены правильно!"
else
    echo_warning "⚠️ Не все файлы настроены правильно"
fi

echo ""
echo_success "✅ Проверка завершена!"
echo ""
echo "🚀 Для применения изменений:"
echo "   1. Перезапустите приложение: npm run dev"
echo "   2. Проверьте в браузере, что нет ошибок telemetry"
echo "   3. Убедитесь, что аутентификация работает" 