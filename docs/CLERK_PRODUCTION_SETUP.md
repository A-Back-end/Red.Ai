# Clerk Production Setup Guide

## Обзор

Этот документ описывает процесс переключения Clerk с development на production режим для Red.AI.

## Текущее состояние

- ✅ Development ключи отключены
- ✅ Проверка на test ключи добавлена
- ✅ Middleware обновлен для production
- ✅ Layout обновлен для production
- ✅ Next.js конфигурация обновлена

## Шаги для переключения на Production

### 1. Получение Production ключей Clerk

1. Перейдите на https://dashboard.clerk.com
2. Выберите ваше приложение
3. Перейдите в "API Keys" в боковой панели
4. Скопируйте "Publishable key" (начинается с `pk_live_`)
5. Скопируйте "Secret key" (начинается с `sk_live_`)
6. Перейдите в "Webhooks" и создайте webhook с URL: `https://redai.site/api/webhooks/clerk`
7. Скопируйте webhook secret (начинается с `whsec_`)

### 2. Обновление .env.production

Замените placeholder значения в `.env.production`:

```bash
# Clerk Production Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_PRODUCTION_KEY
CLERK_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET_KEY
CLERK_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET
```

### 3. Проверка конфигурации

Запустите скрипт проверки:

```bash
# Проверить текущую конфигурацию
node scripts/check-clerk-env.js

# Запустить скрипт переключения на production
./scripts/switch-to-production-clerk.sh
```

### 4. Тестирование

```bash
# Сборка для production
npm run build

# Запуск production сервера
npm start
```

## Изменения в коде

### Middleware (middleware.ts)

```typescript
// Проверка на test ключи
const isClerkConfigured = clerkPublishableKey && 
  !clerkPublishableKey.includes('your_clerk_publishable_key_here') &&
  !clerkPublishableKey.includes('pk_test_');
```

### Layout (app/layout.tsx)

```typescript
// Проверка на production ключи
const isClerkConfigured = clerkPublishableKey && 
  !clerkPublishableKey.includes('your_clerk_publishable_key_here') &&
  !clerkPublishableKey.includes('pk_test_');
```

### Next.js Config (next.config.js)

```javascript
// Пропуск проблемных страниц для test ключей
...((process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('pk_test_') || 
     process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('placeholder') ||
     process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('Y2xlcmsuZGV2ZWxvcG1lbnQ')) && {
  exportPathMap: async function (defaultPathMap) {
    return {
      '/': { page: '/' }
    }
  }
}),
```

## Проверка статуса

### Development режим (текущий)
- ✅ Ключи: `pk_test_*`, `sk_test_*`
- ✅ Работает с: localhost
- ⚠️ Не работает в production

### Production режим (целевой)
- ✅ Ключи: `pk_live_*`, `sk_live_*`
- ✅ Работает с: redai.site
- ✅ Готов для deployment

## Скрипты

### check-clerk-env.js
Проверяет текущую конфигурацию Clerk и показывает статус ключей.

### switch-to-production-clerk.sh
Автоматизированный скрипт для переключения на production режим.

## Troubleshooting

### Ошибка: "Clerk not properly configured"
- Проверьте, что ключи в `.env.production` начинаются с `pk_live_` и `sk_live_`
- Убедитесь, что файл `.env.production` существует

### Ошибка: "Authentication disabled"
- Это нормально для development режима
- В production режиме аутентификация будет работать

### Ошибка: "Webhook not configured"
- Создайте webhook в Clerk dashboard
- URL: `https://redai.site/api/webhooks/clerk`
- Скопируйте webhook secret в `.env.production`

## Безопасность

- ✅ Production ключи никогда не попадают в git
- ✅ Test ключи отключены в production
- ✅ Webhook secrets защищены
- ✅ CORS настроен для production домена

## Следующие шаги

1. Получите production ключи от Clerk
2. Обновите `.env.production`
3. Протестируйте локально
4. Deploy на production сервер
5. Проверьте работу аутентификации 