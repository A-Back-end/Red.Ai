#!/bin/bash

# Скрипт для настройки Clerk для разных сред
# Development: использует test ключи для localhost
# Production: использует live ключи для redai.site

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

echo_step "Настройка Clerk для разных сред..."

# Development keys (для localhost)
DEV_PUBLISHABLE_KEY="pk_test_bGVhcm5pbmctamVubmV0LTgzLmNsZXJrLmFjY291bnRzLmRldiQ"
DEV_SECRET_KEY="sk_test_Q4dXsL37jneHgKUCm87G9B80YPPqoZjNyAoqU5kTEu"

# Production keys (для redai.site)
PROD_PUBLISHABLE_KEY="pk_live_Y2xlcmsucmVkYWkuc2l0ZSQ"
PROD_SECRET_KEY="sk_live_XOBM4dWdsiCF86b4SxGiGMLajYcA2omHPe4Xcn6i9w"

# 1. Создаем .env.development для локальной разработки
echo_step "Создание .env.development для локальной разработки..."
cat > .env.development << 'EOF'
# ==================== Clerk Authentication (DEVELOPMENT) ====================
# Development Clerk Keys - для localhost
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bGVhcm5pbmctamVubmV0LTgzLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_Q4dXsL37jneHgKUCm87G9B80YPPqoZjNyAoqU5kTEu
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Development settings
NEXT_PUBLIC_CLERK_DISABLE_CAPTCHA=true
CLERK_DISABLE_CAPTCHA=true
NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED=true
CLERK_TELEMETRY_DISABLED=true

# Development URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF

echo_success ".env.development создан"

# 2. Создаем .env.production для продакшена
echo_step "Создание .env.production для продакшена..."
cat > .env.production << 'EOF'
# ==================== Clerk Authentication (PRODUCTION) ====================
# Production Clerk Keys - для redai.site
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsucmVkYWkuc2l0ZSQ
CLERK_SECRET_KEY=sk_live_XOBM4dWdsiCF86b4SxGiGMLajYcA2omHPe4Xcn6i9w
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Production settings
NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.redai.site
CLERK_FRONTEND_API=clerk.redai.site
NEXT_PUBLIC_CLERK_DISABLE_CAPTCHA=true
CLERK_DISABLE_CAPTCHA=true
NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED=true
CLERK_TELEMETRY_DISABLED=true

# Production URLs
NEXT_PUBLIC_APP_URL=https://redai.site
NEXT_PUBLIC_API_URL=https://redai.site/api
EOF

echo_success ".env.production создан"

# 3. Обновляем .env.local для локальной разработки
echo_step "Обновление .env.local для локальной разработки..."
cat > .env.local << 'EOF'
# ==================== Clerk Authentication (LOCAL DEVELOPMENT) ====================
# Development Clerk Keys - для localhost
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bGVhcm5pbmctamVubmV0LTgzLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_Q4dXsL37jneHgKUCm87G9B80YPPqoZjNyAoqU5kTEu
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Development settings
NEXT_PUBLIC_CLERK_DISABLE_CAPTCHA=true
CLERK_DISABLE_CAPTCHA=true
NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED=true
CLERK_TELEMETRY_DISABLED=true

# Development URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF

echo_success ".env.local обновлен"

# 4. Создаем .env для Docker
echo_step "Создание .env для Docker..."
cat > .env << 'EOF'
# ==================== Clerk Authentication (DOCKER DEVELOPMENT) ====================
# Development Clerk Keys - для Docker localhost
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bGVhcm5pbmctamVubmV0LTgzLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_Q4dXsL37jneHgKUCm87G9B80YPPqoZjNyAoqU5kTEu
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Development settings
NEXT_PUBLIC_CLERK_DISABLE_CAPTCHA=true
CLERK_DISABLE_CAPTCHA=true
NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED=true
CLERK_TELEMETRY_DISABLED=true

# Development URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF

echo_success ".env создан"

# 5. Обновляем middleware.ts для правильной работы с разными средами
echo_step "Обновление middleware.ts..."
cat > middleware.ts << 'EOF'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',           // Home page
  '/login(.*)',  // Login page and any sub-routes
  '/auth(.*)',   // Auth page and any sub-routes
  '/api/webhooks(.*)', // Webhook endpoints
  '/api/health(.*)', // Health check endpoints
  '/showcase',   // Showcase page
  '/image-generator', // Image generator page
  '/interior-design', // Interior design page
]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/project(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Get the host from the request
  const host = req.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  const isProduction = host.includes('redai.site');
  
  // Check if Clerk is properly configured
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = clerkPublishableKey && !clerkPublishableKey.includes('your_clerk_publishable_key_here');
  
  // If Clerk is not configured, allow all routes
  if (!isClerkConfigured) {
    console.log('⚠️ Clerk not configured, allowing all routes');
    return NextResponse.next();
  }
  
  // For development (localhost), allow all routes without authentication
  if (isLocalhost) {
    console.log('🔧 Development mode: allowing all routes on localhost');
    return NextResponse.next();
  }
  
  // For production, enforce authentication on protected routes
  if (isProduction && isProtectedRoute(req)) {
    try {
      const { userId } = await auth();
      if (!userId) {
        console.log('🔒 Production: redirecting to login for protected route');
        return NextResponse.redirect(new URL('/login', req.url));
      }
    } catch (error) {
      console.error('❌ Clerk authentication error:', error);
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  
  // Allow all other routes to proceed
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Exclude files with a "." followed by an extension, which are typically static files.
    // Exclude files in the _next directory, but allow authentication on _next/data routes.
    // Exclude folders like api/trpc which are handled separately
    '/((?!.*\\..*|_next|api/webhooks|api/health).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
EOF

echo_success "middleware.ts обновлен"

# 6. Обновляем layout.tsx для правильной конфигурации ClerkProvider
echo_step "Обновление ClerkProvider в layout.tsx..."

# Создаем временный файл с обновленной конфигурацией
cat > temp_layout_clerk.tsx << 'EOF'
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      signInUrl="/login"
      signUpUrl="/login"
      telemetry={false}
      allowedRedirectOrigins={[
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'https://redai.site',
        'https://www.redai.site'
      ]}
    >
EOF

echo_success "Конфигурация ClerkProvider подготовлена"

# 7. Проверяем результат
echo_step "Проверка конфигурации..."
echo ""

echo "📋 Текущие конфигурации:"
echo ""

echo "🔧 .env.development:"
if [ -f ".env.development" ]; then
    grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.development
else
    echo_error "❌ .env.development не найден"
fi

echo ""

echo "🔧 .env.production:"
if [ -f ".env.production" ]; then
    grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.production
else
    echo_error "❌ .env.production не найден"
fi

echo ""

echo "🔧 .env.local:"
if [ -f ".env.local" ]; then
    grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.local
else
    echo_error "❌ .env.local не найден"
fi

echo ""

echo_success "✅ Настройка Clerk для разных сред завершена!"
echo ""
echo "📋 Инструкции по использованию:"
echo ""
echo "🚀 Для локальной разработки:"
echo "   npm run dev"
echo "   # Использует development ключи (pk_test_*)"
echo ""
echo "🐳 Для Docker разработки:"
echo "   docker-compose up"
echo "   # Использует development ключи (pk_test_*)"
echo ""
echo "🚀 Для продакшена:"
echo "   NODE_ENV=production npm run build && npm start"
echo "   # Использует production ключи (pk_live_*)"
echo ""
echo "📝 Важные замечания:"
echo "   1. Development ключи работают только с localhost"
echo "   2. Production ключи работают только с redai.site"
echo "   3. Middleware автоматически определяет среду по домену"
echo "   4. В development режиме аутентификация отключена"
echo "   5. В production режиме аутентификация обязательна для защищенных маршрутов" 