# 🔧 Server Fixes Applied - Red.AI

## 🚨 **Проблемы, которые были исправлены:**

### 1. **Ошибка удаления проектов**
- **Проблема:** `Failed to delete project` - 500 Internal Server Error
- **Причина:** Неправильные права доступа к файлу `database/projects.json` в Docker контейнере
- **Решение:** 
  - Добавлен пользователь `appuser` в Dockerfile.backend
  - Исправлены права доступа к директориям
  - Добавлено монтирование database директории в docker-compose

### 2. **Проблемы с сохранением проектов после генерации**
- **Проблема:** Проекты не сохранялись после успешной генерации изображений
- **Причина:** Отсутствие монтирования database директории в контейнер
- **Решение:** Добавлен volume `./database:/app/database` в docker-compose-redai-prod.yml

### 3. **Улучшения в API проектов**
- Добавлена функция `ensureDatabaseDirectory()` для создания директории если её нет
- Улучшено логирование ошибок
- Добавлена проверка существования файла перед чтением/записью

## 📁 **Изменённые файлы:**

### 1. `Dockerfile.backend`
```dockerfile
# Добавлено:
RUN mkdir -p uploads logs generated-images database
RUN chmod 755 uploads logs generated-images database

# Создание пользователя для безопасности
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app

# Переключение на непривилегированного пользователя
USER appuser
```

### 2. `app/api/projects/route.ts`
```typescript
// Добавлено:
async function ensureDatabaseDirectory(): Promise<void> {
  const dbDir = path.dirname(dbPath);
  try {
    await fs.access(dbDir);
  } catch {
    await fs.mkdir(dbDir, { recursive: true });
  }
}

// Улучшено логирование в writeProjects()
console.log(`Successfully wrote ${projects.length} projects to database`);
```

### 3. `docker-compose-redai-prod.yml`
```yaml
backend:
  volumes:
    - ./uploads:/app/uploads
    - ./public/generated-images:/app/generated-images
    - ./database:/app/database  # ← Добавлено
```

## 🛠️ **Скрипты для исправления:**

### 1. `fix-server-issues.sh`
- Останавливает все контейнеры
- Создаёт резервную копию базы данных
- Исправляет права доступа к файлам
- Пересобирает Docker образы
- Запускает сервисы с новой конфигурацией
- Тестирует API endpoints

### 2. `deploy-server-fix.sh`
- Обновляет git репозиторий
- Запускает fix-server-issues.sh
- Применяет дополнительные исправления
- Перезапускает сервисы
- Тестирует приложение

## 🚀 **Инструкция по применению исправлений:**

### На сервере redai.site:

```bash
# 1. Подключитесь к серверу
ssh user@redai.site

# 2. Перейдите в директорию проекта
cd /path/to/red-ai

# 3. Запустите скрипт исправления
./deploy-server-fix.sh
```

### Локально для тестирования:

```bash
# 1. Запустите скрипт исправления
./fix-server-issues.sh

# 2. Проверьте работу приложения
npm run dev
```

## ✅ **Проверка исправлений:**

### 1. **Тест удаления проектов:**
- Зайдите в раздел "My Projects"
- Попробуйте удалить любой проект
- Должно работать без ошибок

### 2. **Тест сохранения проектов:**
- Создайте новый дизайн в "Design Studio"
- После генерации изображения проект должен автоматически сохраниться
- Проверьте в разделе "My Projects"

### 3. **Проверка логов:**
```bash
# Просмотр логов в реальном времени
docker-compose -f docker-compose-redai-prod.yml logs -f

# Просмотр логов конкретного сервиса
docker-compose -f docker-compose-redai-prod.yml logs backend
```

## 🔍 **Мониторинг:**

### Проверка статуса сервисов:
```bash
docker-compose -f docker-compose-redai-prod.yml ps
```

### Проверка прав доступа в контейнере:
```bash
docker-compose -f docker-compose-redai-prod.yml exec backend ls -la /app/database/
```

### Тест API endpoints:
```bash
# Тест получения проектов
curl https://redai.site/api/projects?userId=test-user

# Тест создания проекта
curl -X POST https://redai.site/api/projects \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","name":"Test","description":"Test"}'

# Тест удаления проекта
curl -X DELETE https://redai.site/api/projects?projectId=test-id
```

## 🚨 **Если проблемы остаются:**

### 1. **Проверьте логи:**
```bash
docker-compose -f docker-compose-redai-prod.yml logs --tail=50
```

### 2. **Перезапустите сервисы:**
```bash
docker-compose -f docker-compose-redai-prod.yml restart
```

### 3. **Пересоберите образы:**
```bash
docker-compose -f docker-compose-redai-prod.yml up -d --build
```

### 4. **Проверьте права доступа:**
```bash
ls -la database/
sudo chown -R $USER:$USER database/
chmod 644 database/projects.json
```

## 📞 **Поддержка:**

Если проблемы не решены после применения всех исправлений, проверьте:

1. **Логи сервера** на наличие специфических ошибок
2. **Права доступа** к файлам и директориям
3. **Конфигурацию Docker** и volumes
4. **Сетевые настройки** и firewall

---

**Дата применения исправлений:** $(date)
**Версия:** 1.0.0
**Статус:** ✅ Применено 