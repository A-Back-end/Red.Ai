# Clerk Localhost Fix Documentation

## 🐛 Проблема

Ошибка аутентификации Clerk при разработке на localhost:

```
Error: Clerk: Production Keys are only allowed for domain "redai.site". 
API Error: The Request HTTP Origin header must be equal to or a subdomain of the requesting URL.
```

## 🔍 Причина

Production ключи Clerk (`pk_live_*`) работают **только с зарегистрированным доменом** (redai.site). Для localhost разработки нужны тестовые ключи (`pk_test_*`).

## ✅ Решение

### 1. Автоматическое исправление

```bash
# Запустите скрипт автоматического исправления
./scripts/fix-clerk-localhost.sh

# Проверьте результат
./scripts/test-clerk-fix.sh
```

### 2. Ручное исправление

1. **Создайте .env.local файл:**
```bash
# FORCE DEVELOPMENT MODE FIRST!
NODE_ENV=development

# Clerk для localhost development (TEST KEYS)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bGVhcm5pbmctamVubmV0LTgzLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_Q4dXsL37jneHgKUCm87G9B80YPPqoZjNyAoqU5kTEu

# App URLs для localhost
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000

# Disable Clerk captcha for easier development  
NEXT_PUBLIC_CLERK_DISABLE_CAPTCHA=true
```

2. **Переместите production файл:**
```bash
mv env.production.local env.production.local.backup
```

3. **Очистите кэш и перезапустите:**
```bash
rm -rf .next
npm run dev
```

## 🧪 Проверка

### В терминале:
```bash
# Проверить переменные окружения
node scripts/check-clerk-env.js

# Полная проверка конфигурации
./scripts/test-clerk-fix.sh
```

### В браузере:
1. Откройте `http://localhost:3000`
2. Проверьте debug панель в правом нижнем углу
3. Убедитесь, что отображается "TEST (Development)"
4. Ошибки Clerk больше не должны появляться

## 📋 Типы ключей

| Тип ключа | Префикс | Работает с | Назначение |
|-----------|---------|------------|------------|
| Test | `pk_test_*` | localhost, любые домены | Development |
| Live | `pk_live_*` | только зарегистрированные домены | Production |

## 🔄 Переключение между окружениями

### Development (localhost):
```bash
# Используйте .env.local с pk_test_ ключами
NODE_ENV=development
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Production (redai.site):
```bash
# Используйте env.production.local с pk_live_ ключами
NODE_ENV=production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

## 🛠️ Полезные скрипты

- `scripts/fix-clerk-localhost.sh` - Автоматическое исправление для localhost
- `scripts/check-clerk-env.js` - Проверка переменных окружения
- `scripts/test-clerk-fix.sh` - Комплексное тестирование исправления

## 📝 Приоритет файлов окружения в Next.js

1. `.env.production.local` (если NODE_ENV=production)
2. `.env.local` 
3. `.env.production` (если NODE_ENV=production)
4. `.env`

**Важно:** `.env.local` всегда имеет приоритет над `.env`, поэтому мы используем его для development настроек.

## 🚨 Частые ошибки

### 1. Кэширование браузера
```bash
# Очистите кэш браузера или используйте инкогнито режим
# Или очистите .next кэш
rm -rf .next
```

### 2. Неправильный NODE_ENV
```bash
# Убедитесь, что NODE_ENV=development в .env.local
echo "NODE_ENV=development" >> .env.local
```

### 3. Конфликт файлов окружения
```bash
# Переместите или удалите conflicting файлы
mv env.production.local env.production.local.backup
```

## 🔐 Безопасность

- ✅ Файлы `.env*` добавлены в `.gitignore`
- ✅ Тестовые ключи безопасны для публичных репозиториев
- ⚠️ **Никогда не коммитьте production ключи!**

## 🎯 Результат

После исправления:
- ✅ Localhost разработка работает без ошибок Clerk
- ✅ Аутентификация функционирует корректно
- ✅ Debug панель показывает правильную конфигурацию
- ✅ Production ключи сохранены в backup файле 