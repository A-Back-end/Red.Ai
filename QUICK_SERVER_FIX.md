# 🚀 Quick Server Fix - Red.AI

## 🚨 **Проблемы:**
- ❌ `Failed to delete project` - 500 Internal Server Error
- ❌ Проекты не сохраняются после генерации изображений
- ❌ Ошибки прав доступа к файлу `database/projects.json`

## ✅ **Решение (5 минут):**

### 1. **Подключитесь к серверу:**
```bash
ssh user@redai.site
cd /path/to/red-ai
```

### 2. **Запустите автоматический скрипт исправления:**
```bash
./deploy-server-fix.sh
```

### 3. **Или выполните вручную:**
```bash
# Остановить контейнеры
docker-compose -f docker-compose-redai-prod.yml down

# Исправить права доступа
sudo chown -R $USER:$USER database/
chmod 755 database/
chmod 644 database/projects.json

# Пересобрать образы
docker build -f Dockerfile.backend -t redai-backend:latest .
docker build -f Dockerfile.frontend -t redai-frontend:latest .

# Запустить сервисы
docker-compose -f docker-compose-redai-prod.yml up -d
```

## 🧪 **Проверка исправлений:**

### Тест 1: Удаление проектов
1. Зайдите на https://redai.site
2. Перейдите в "My Projects"
3. Попробуйте удалить любой проект
4. ✅ Должно работать без ошибок

### Тест 2: Сохранение проектов
1. Создайте новый дизайн в "Design Studio"
2. После генерации изображения
3. ✅ Проект должен автоматически сохраниться в "My Projects"

### Тест 3: API тест
```bash
./test-api-fix.sh
```

## 📊 **Мониторинг:**
```bash
# Статус сервисов
docker-compose -f docker-compose-redai-prod.yml ps

# Логи в реальном времени
docker-compose -f docker-compose-redai-prod.yml logs -f

# Логи только backend
docker-compose -f docker-compose-redai-prod.yml logs backend
```

## 🔧 **Что было исправлено:**

### 1. **Dockerfile.backend**
- ✅ Добавлен пользователь `appuser`
- ✅ Исправлены права доступа к директориям
- ✅ Создание database директории

### 2. **docker-compose-redai-prod.yml**
- ✅ Добавлен volume `./database:/app/database`

### 3. **app/api/projects/route.ts**
- ✅ Улучшена обработка ошибок
- ✅ Добавлено создание директории если её нет
- ✅ Улучшено логирование

## 🚨 **Если проблемы остаются:**

### Проверьте логи:
```bash
docker-compose -f docker-compose-redai-prod.yml logs --tail=50
```

### Перезапустите сервисы:
```bash
docker-compose -f docker-compose-redai-prod.yml restart
```

### Проверьте права доступа:
```bash
ls -la database/
docker-compose -f docker-compose-redai-prod.yml exec backend ls -la /app/database/
```

## 📞 **Поддержка:**
- Логи: `docker-compose -f docker-compose-redai-prod.yml logs`
- Статус: `docker-compose -f docker-compose-redai-prod.yml ps`
- Тест API: `./test-api-fix.sh`

---

**Время применения:** ~5 минут  
**Статус:** ✅ Готово к применению  
**Тестирование:** ✅ Автоматизировано 