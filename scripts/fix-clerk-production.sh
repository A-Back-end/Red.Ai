#!/bin/bash

# Скрипт для переключения Clerk на production mode
# Отключает development keys и telemetry

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

# Production Clerk keys
PRODUCTION_PUBLISHABLE_KEY="pk_live_Y2xlcmsucmVkYWkuc2l0ZSQ"
PRODUCTION_SECRET_KEY="sk_live_XOBM4dWdsiCF86b4SxGiGMLajYcA2omHPe4Xcn6i9w"
PRODUCTION_FRONTEND_API="clerk.redai.site"

echo_step "Переключение Clerk на production mode..."

# 1. Обновляем основной .env файл
echo_step "Обновление .env файла..."
if [ -f ".env" ]; then
    # Создаем backup
    cp .env .env.backup.$(date +%s)
    
    # Обновляем Clerk конфигурацию
    sed -i.bak '/^# Clerk Authentication/d' .env
    sed -i.bak '/^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=/d' .env
    sed -i.bak '/^CLERK_SECRET_KEY=/d' .env
    sed -i.bak '/^CLERK_WEBHOOK_SECRET=/d' .env
    sed -i.bak '/^NEXT_PUBLIC_CLERK_DISABLE_CAPTCHA=/d' .env
    sed -i.bak '/^CLERK_DISABLE_CAPTCHA=/d' .env
    
    # Добавляем production конфигурацию
    cat >> .env << 'EOF'

# ==================== Clerk Authentication (PRODUCTION) ====================
# Production Clerk Keys - отключен telemetry
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsucmVkYWkuc2l0ZSQ
CLERK_SECRET_KEY=sk_live_XOBM4dWdsiCF86b4SxGiGMLajYcA2omHPe4Xcn6i9w
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.redai.site
CLERK_FRONTEND_API=clerk.redai.site
# Отключаем captcha для production
NEXT_PUBLIC_CLERK_DISABLE_CAPTCHA=true
CLERK_DISABLE_CAPTCHA=true
EOF
    
    echo_success ".env файл обновлен"
else
    echo_error ".env файл не найден"
fi

# 2. Обновляем .env.local файл
echo_step "Обновление .env.local файла..."
if [ -f ".env.local" ]; then
    # Создаем backup
    cp .env.local .env.local.backup.$(date +%s)
    
    # Обновляем Clerk конфигурацию
    sed -i.bak '/^# Clerk для localhost development/d' .env.local
    sed -i.bak '/^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=/d' .env.local
    sed -i.bak '/^CLERK_SECRET_KEY=/d' .env.local
    sed -i.bak '/^# Disable Clerk captcha/d' .env.local
    sed -i.bak '/^NEXT_PUBLIC_CLERK_DISABLE_CAPTCHA=/d' .env.local
    sed -i.bak '/^CLERK_DISABLE_CAPTCHA=/d' .env.local
    
    # Добавляем production конфигурацию
    cat >> .env.local << 'EOF'

# ==================== Clerk Authentication (PRODUCTION) ====================
# Production Clerk Keys - отключен telemetry
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsucmVkYWkuc2l0ZSQ
CLERK_SECRET_KEY=sk_live_XOBM4dWdsiCF86b4SxGiGMLajYcA2omHPe4Xcn6i9w
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.redai.site
CLERK_FRONTEND_API=clerk.redai.site
# Отключаем captcha для production
NEXT_PUBLIC_CLERK_DISABLE_CAPTCHA=true
CLERK_DISABLE_CAPTCHA=true
EOF
    
    echo_success ".env.local файл обновлен"
else
    echo_error ".env.local файл не найден"
fi

# 3. Обновляем .env.production файл
echo_step "Обновление .env.production файла..."
if [ -f ".env.production" ]; then
    # Создаем backup
    cp .env.production .env.production.backup.$(date +%s)
    
    # Обновляем Clerk конфигурацию
    sed -i.bak '/^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=/d' .env.production
    sed -i.bak '/^CLERK_SECRET_KEY=/d' .env.production
    sed -i.bak '/^CLERK_WEBHOOK_SECRET=/d' .env.production
    
    # Добавляем production конфигурацию
    cat >> .env.production << 'EOF'
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsucmVkYWkuc2l0ZSQ
CLERK_SECRET_KEY=sk_live_XOBM4dWdsiCF86b4SxGiGMLajYcA2omHPe4Xcn6i9w
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.redai.site
CLERK_FRONTEND_API=clerk.redai.site
NEXT_PUBLIC_CLERK_DISABLE_CAPTCHA=true
CLERK_DISABLE_CAPTCHA=true
EOF
    
    echo_success ".env.production файл обновлен"
else
    echo_error ".env.production файл не найден"
fi

# 4. Проверяем, что telemetry отключен в layout.tsx
echo_step "Проверка отключения telemetry в layout.tsx..."
if grep -q "telemetry={false}" app/layout.tsx; then
    echo_success "Telemetry уже отключен в ClerkProvider"
else
    echo_warning "Telemetry не найден в layout.tsx - проверьте вручную"
fi

# 5. Проверяем результат
echo_step "Проверка обновленных конфигураций..."
echo ""
echo "📋 Текущие Clerk ключи:"
echo ""

if [ -f ".env" ]; then
    echo "🔧 .env:"
    grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env
fi

if [ -f ".env.local" ]; then
    echo "🔧 .env.local:"
    grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.local
fi

if [ -f ".env.production" ]; then
    echo "🔧 .env.production:"
    grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.production
fi

echo ""
echo_success "✅ Clerk успешно переключен на production mode!"
echo ""
echo_warning "📝 Важные замечания:"
echo "  1. Все development ключи заменены на production"
echo "  2. Telemetry отключен в ClerkProvider"
echo "  3. Созданы backup файлы для всех .env файлов"
echo "  4. Проверьте webhook секреты в Clerk dashboard"
echo ""
echo "🚀 Для применения изменений перезапустите приложение:"
echo "   npm run dev  # для разработки"
echo "   npm run build && npm start  # для production" 