# 🔐 Clerk Production Setup - Red.AI

## ✅ Что сделано

Development режим Clerk **отключен**. Теперь приложение будет работать только с production ключами.

### Изменения в коде:

1. **middleware.ts** - добавлена проверка на test ключи
2. **app/layout.tsx** - отключена аутентификация для test ключей  
3. **next.config.js** - обновлена конфигурация для production
4. **scripts/** - созданы скрипты проверки и переключения

## 🚀 Как переключиться на Production

### Шаг 1: Получите Production ключи Clerk

1. Перейдите на https://dashboard.clerk.com
2. Выберите ваше приложение
3. Перейдите в **"API Keys"** в боковой панели
4. Скопируйте **"Publishable key"** (начинается с `pk_live_`)
5. Скопируйте **"Secret key"** (начинается с `sk_live_`)
6. Перейдите в **"Webhooks"** и создайте webhook:
   - URL: `https://redai.site/api/webhooks/clerk`
   - Скопируйте webhook secret (начинается с `whsec_`)

### Шаг 2: Обновите .env.production

Замените placeholder значения в `.env.production`:

```bash
# Clerk Production Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_ACTUAL_PRODUCTION_KEY
CLERK_SECRET_KEY=sk_live_YOUR_ACTUAL_SECRET_KEY
CLERK_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_WEBHOOK_SECRET
```

### Шаг 3: Проверьте конфигурацию

```bash
# Проверить текущую конфигурацию
node scripts/check-clerk-env.js

# Запустить скрипт переключения
./scripts/switch-to-production-clerk.sh
```

### Шаг 4: Протестируйте

```bash
# Сборка для production
npm run build

# Запуск production сервера
npm start
```

## 🔍 Проверка статуса

### Текущий статус (Development):
- ❌ Ключи: `pk_test_*`, `sk_test_*`
- ❌ Аутентификация отключена
- ❌ Не готов для production

### Целевой статус (Production):
- ✅ Ключи: `pk_live_*`, `sk_live_*`
- ✅ Аутентификация работает
- ✅ Готов для deployment

## 📁 Файлы конфигурации

- `.env` - development конфигурация (test ключи)
- `.env.production` - production конфигурация (live ключи)
- `middleware.ts` - проверка ключей
- `app/layout.tsx` - условная аутентификация
- `next.config.js` - production настройки

## 🛠️ Скрипты

### `scripts/check-clerk-env.js`
Проверяет текущую конфигурацию Clerk:
```bash
node scripts/check-clerk-env.js
```

### `scripts/switch-to-production-clerk.sh`
Автоматизированный скрипт переключения:
```bash
./scripts/switch-to-production-clerk.sh
```

## ⚠️ Важные моменты

1. **Development ключи отключены** - приложение не будет работать с test ключами
2. **Production ключи обязательны** - без live ключей аутентификация отключена
3. **Webhook обязателен** - для корректной работы user management
4. **CORS настроен** - только для redai.site домена

## 🔒 Безопасность

- ✅ Production ключи не попадают в git
- ✅ Test ключи отключены в production
- ✅ Webhook secrets защищены
- ✅ CORS ограничен production доменом

## 📚 Документация

Подробная документация: `docs/CLERK_PRODUCTION_SETUP.md`

## 🆘 Troubleshooting

### Ошибка: "Clerk not properly configured"
```bash
# Проверьте ключи
node scripts/check-clerk-env.js

# Убедитесь, что .env.production содержит live ключи
cat .env.production | grep CLERK
```

### Ошибка: "Authentication disabled"
Это нормально для development режима. В production режиме аутентификация будет работать.

### Ошибка: "Webhook not configured"
Создайте webhook в Clerk dashboard с URL: `https://redai.site/api/webhooks/clerk`

## 🎯 Следующие шаги

1. ✅ Получите production ключи от Clerk
2. ✅ Обновите `.env.production`
3. ✅ Протестируйте локально
4. ✅ Deploy на production сервер
5. ✅ Проверьте работу аутентификации

---

**Статус**: Development режим отключен, готов к переключению на production ключи. 