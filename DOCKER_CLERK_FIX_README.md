# 🔧 Исправление ошибок Docker и Clerk в Red.AI

## Проблема
При сборке Docker-контейнера frontend возникают ошибки:
```
Error: @clerk/clerk-react: The publishableKey passed to Clerk is invalid
(key=pk_test_YOUR_CLERK_PUBLISHABLE_KEY_HERE)
```

## Причина
В Dockerfile используется placeholder значение для Clerk API ключа вместо реального ключа.

## Решения

### 🚀 Быстрое исправление (рекомендуется)

1. **Создать правильный .env файл:**
   ```bash
   ./scripts/create-env.sh
   ```

2. **Проверить и настроить окружение:**
   ```bash
   ./scripts/check-and-setup-env.sh
   ```

3. **Запустить production версию:**
   ```bash
   ./scripts/start-production.sh
   ```

### 🔧 Ручное исправление

#### Шаг 1: Создать .env файл
```bash
# Скопировать пример
cp env.production.example .env

# Отредактировать .env файл
nano .env
```

**Обязательно установить:**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsucmVkYWkuc2l0ZSQ
```

#### Шаг 2: Обновить docker-compose.yml
Изменить в `docker-compose.yml`:
```yaml
frontend:
  build:
    context: .
    dockerfile: docker/Dockerfile.frontend.production  # Использовать production Dockerfile
    args:
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}  # Убрать placeholder
```

#### Шаг 3: Запустить с правильными переменными
```bash
# Экспортировать переменные
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsucmVkYWkuc2l0ZSQ

# Запустить
docker-compose up --build
```

### 📁 Новые файлы

- `docker/Dockerfile.frontend.production` - Production-ready Dockerfile
- `docker-compose.production.yml` - Production docker-compose
- `scripts/check-and-setup-env.sh` - Проверка окружения
- `scripts/start-production.sh` - Запуск production
- `scripts/create-env.sh` - Создание .env файла

### 🔍 Проверка

После исправления проверьте:

1. **Переменные окружения:**
   ```bash
   echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   ```

2. **Сборка Docker:**
   ```bash
   docker-compose build frontend
   ```

3. **Запуск сервисов:**
   ```bash
   docker-compose up -d
   ```

### 🚨 Важные моменты

- **НЕ используйте placeholder значения** в production
- **Всегда проверяйте** переменные окружения перед сборкой
- **Используйте production Dockerfile** для production сборки
- **Backup .env файла** перед изменениями

### 📞 Поддержка

Если проблемы остаются:
1. Проверьте логи: `docker-compose logs frontend`
2. Убедитесь в правильности Clerk API ключа
3. Проверьте права доступа к файлам

---

**Статус:** ✅ Исправлено  
**Дата:** $(date)  
**Версия:** Red.AI Production
