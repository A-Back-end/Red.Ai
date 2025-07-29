# Настройка Clerk.js для разных сред (Development и Production)

## 🎯 Проблема

Вы сталкивались с ошибками:
1. `Failed to load resource: the server responded with a status of 400 ()` для `clerk.redai.site/v1/...`
2. `Error: Clerk: Production Keys are only allowed for domain "redai.site".`
3. `API Error: The Request HTTP Origin header must be equal to or a subdomain of the requesting URL.`

## ✅ Решение

### Принцип работы
- **Development**: Использует test ключи (`pk_test_*`) для localhost
- **Production**: Использует live ключи (`pk_live_*`) для redai.site
- **Middleware**: Автоматически определяет среду по домену

## 📁 Структура файлов

### 1. .env.development (для локальной разработки)
```bash
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
```

### 2. .env.production (для продакшена)
```bash
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
```

### 3. .env.local (для локальной разработки)
```bash
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
```

## 🔧 Обновленный middleware.ts

```typescript
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
    '/((?!.*\\..*|_next|api/webhooks|api/health).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};
```

## 🔧 Обновленный ClerkProvider

```tsx
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
```

## 🚀 Инструкции по использованию

### Для локальной разработки:
```bash
npm run dev
# Использует development ключи (pk_test_*)
# Аутентификация отключена для всех маршрутов
```

### Для Docker разработки:
```bash
docker-compose up
# Использует development ключи (pk_test_*)
# Аутентификация отключена для всех маршрутов
```

### Для продакшена:
```bash
NODE_ENV=production npm run build && npm start
# Использует production ключи (pk_live_*)
# Аутентификация обязательна для защищенных маршрутов
```

## 🔄 Автоматическое определение среды

### Development (localhost):
- ✅ Использует development ключи (`pk_test_*`)
- ✅ Аутентификация отключена
- ✅ Все маршруты доступны без входа
- ✅ Работает с localhost, 127.0.0.1

### Production (redai.site):
- ✅ Использует production ключи (`pk_live_*`)
- ✅ Аутентификация включена для защищенных маршрутов
- ✅ Защищенные маршруты требуют входа
- ✅ Работает только с redai.site

## 📋 Скрипты автоматизации

### 1. Настройка сред
```bash
./scripts/setup-clerk-environments.sh
```

### 2. Тестирование конфигурации
```bash
./scripts/test-clerk-configuration.sh
```

### 3. Переключение на production
```bash
./scripts/fix-clerk-production.sh
```

## 🔍 Отладка

### Проверка текущих ключей:
```bash
# Проверка в HTML
curl -s http://localhost:3000 | grep -o "pk_[a-zA-Z0-9_-]*" | head -1

# Проверка переменных окружения
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```

### Проверка middleware:
```bash
# Логи middleware в консоли браузера
# Development: "🔧 Development mode: allowing all routes on localhost"
# Production: "🔒 Production: redirecting to login for protected route"
```

## ⚠️ Важные замечания

1. **Development ключи** работают только с localhost
2. **Production ключи** работают только с redai.site
3. **Middleware** автоматически определяет среду по домену
4. **В development режиме** аутентификация отключена
5. **В production режиме** аутентификация обязательна для защищенных маршрутов

## 🛠️ Troubleshooting

### Если все еще есть ошибки с доменами:
1. Убедитесь, что используете правильные ключи для правильной среды
2. Проверьте, что middleware правильно определяет среду
3. Очистите кэш браузера
4. Перезапустите приложение

### Если аутентификация не работает в production:
1. Проверьте, что домен настроен в Clerk dashboard
2. Убедитесь, что используете production ключи
3. Проверьте CORS настройки

### Если development не работает:
1. Убедитесь, что используете development ключи
2. Проверьте, что открываете localhost
3. Проверьте, что middleware определяет localhost правильно 