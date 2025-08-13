# Clerk Production Mode Setup

## Обзор

Данный документ описывает процесс переключения Clerk с development mode на production mode и отключения telemetry для устранения ошибки `clerk-telemetry.com/v1/event:1 Failed to load resource: the server responded with a status of 400`.

## Проблема

В development mode Clerk отправляет telemetry данные на `clerk-telemetry.com`, что может вызывать ошибки 400 и замедлять работу приложения.

## Решение

### 1. Переключение на Production Keys

Все development ключи (`pk_test_*`) заменены на production ключи (`pk_live_*`):

```bash
# Development keys (отключены)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bGVhcm5pbmctamVubmV0LTgzLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_Q4dXsL37jneHgKUCm87G9B80YPPqoZjNyAoqU5kTEu

# Production keys (активны)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsucmVkYWkuc2l0ZSQ
CLERK_SECRET_KEY=sk_live_XOBM4dWdsiCF86b4SxGiGMLajYcA2omHPe4Xcn6i9w
```

### 2. Отключение Telemetry

#### В ClerkProvider (app/layout.tsx)
```tsx
<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  telemetry={false}  // ← Отключено
  // ... другие настройки
>
```

#### В переменных окружения
```bash
# Отключаем telemetry полностью
NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED=true
CLERK_TELEMETRY_DISABLED=true
```

### 3. Обновленные .env файлы

#### .env
```bash
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
# Отключаем telemetry полностью
NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED=true
CLERK_TELEMETRY_DISABLED=true
```

#### .env.local
```bash
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
# Отключаем telemetry полностью
NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED=true
CLERK_TELEMETRY_DISABLED=true
```

#### .env.production
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsucmVkYWkuc2l0ZSQ
CLERK_SECRET_KEY=sk_live_XOBM4dWdsiCF86b4SxGiGMLajYcA2omHPe4Xcn6i9w
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.redai.site
CLERK_FRONTEND_API=clerk.redai.site
NEXT_PUBLIC_CLERK_DISABLE_CAPTCHA=true
CLERK_DISABLE_CAPTCHA=true
# Отключаем telemetry полностью
NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED=true
CLERK_TELEMETRY_DISABLED=true
```

## Скрипты автоматизации

### 1. Переключение на Production Mode
```bash
./scripts/fix-clerk-production.sh
```

Этот скрипт:
- Заменяет все development ключи на production
- Добавляет переменные для отключения telemetry
- Создает backup файлы
- Проверяет конфигурацию

### 2. Проверка и очистка кэша
```bash
./scripts/verify-clerk-production.sh
```

Этот скрипт:
- Проверяет все .env файлы
- Убеждается, что telemetry отключен
- Очищает Next.js кэш
- Проверяет Docker конфигурации

## Результат

✅ **Устранена ошибка telemetry**: `clerk-telemetry.com/v1/event:1 Failed to load resource: the server responded with a status of 400`

✅ **Улучшена производительность**: Убраны лишние запросы к telemetry серверам

✅ **Безопасность**: Используются production ключи вместо development

✅ **Консистентность**: Все окружения используют одинаковые production ключи

## Проверка

После применения изменений:

1. Перезапустите приложение:
   ```bash
   npm run dev
   ```

2. Проверьте в браузере:
   - Нет ошибок в консоли
   - Аутентификация работает
   - Нет запросов к `clerk-telemetry.com`

3. Проверьте в Network tab:
   - Нет запросов к telemetry endpoints
   - Все запросы к Clerk API работают нормально

## Backup файлы

Созданы backup файлы с timestamp:
- `.env.backup.1753782484`
- `.env.local.backup.1753782484`
- `.env.production.backup.1753781884`

Для восстановления development mode используйте эти файлы.

## Важные замечания

1. **Webhook секреты**: Проверьте и обновите webhook секреты в Clerk dashboard
2. **Домены**: Убедитесь, что домены настроены правильно в Clerk dashboard
3. **CORS**: Проверьте настройки CORS для production доменов
4. **Тестирование**: Протестируйте аутентификацию в production окружении

## Troubleshooting

### Если аутентификация не работает:
1. Проверьте, что production ключи правильные
2. Убедитесь, что домены настроены в Clerk dashboard
3. Проверьте CORS настройки

### Если все еще есть ошибки telemetry:
1. Очистите кэш браузера
2. Перезапустите приложение
3. Проверьте, что `telemetry={false}` установлен в ClerkProvider

### Для возврата к development mode:
```bash
# Восстановите backup файлы
cp .env.backup.1753782484 .env
cp .env.local.backup.1753782484 .env.local
cp .env.production.backup.1753781884 .env.production
``` 