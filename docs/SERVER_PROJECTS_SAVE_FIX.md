# 🔧 Исправление проблемы сохранения проектов на сервере

## Проблема
```
POST https://redai.site/api/projects 500 (Internal Server Error)
Save project HTTP error: 500 {"error":"Failed to save project after multiple attempts"}
```

На сервере не работает сохранение проектов, хотя локально и в Docker всё функционирует корректно.

## Анализ причин

### Основная причина: Права доступа к файловой системе
- **Локально**: Процесс Next.js запускается от имени пользователя с полными правами
- **На сервере**: Процесс может запускаться от имени ограниченного пользователя
- **В Docker**: Может отличаться маппинг volume и права доступа

### Дополнительные факторы:
1. **Место на диске**: Может закончиться свободное место
2. **Concurrent access**: Файл может быть заблокирован другим процессом
3. **Файловая система**: Различия в поведении файловых систем
4. **Atomic operations**: Проблемы с rename операциями

## Реализованные исправления

### 1. 🔍 Диагностический скрипт сервера
**Файл**: `scripts/server-project-save-fix.sh`

```bash
./scripts/server-project-save-fix.sh
```

**Что проверяет:**
- ✅ Права доступа к директории `database/`
- ✅ Права доступа к файлу `projects.json`
- ✅ Возможность записи и atomic операций
- ✅ Наличие свободного места на диске
- ✅ Блокировки файлов
- ✅ Валидность JSON
- ✅ Тестирование API endpoint

**Что исправляет:**
- 🔧 Создает директорию `database/` если отсутствует
- 🔧 Исправляет права доступа (755 для директории, 644 для файла)
- 🔧 Создает пустую базу данных если файл отсутствует
- 🔧 Исправляет невалидный JSON

### 2. 🚀 Улучшенный API с диагностикой
**Файл**: `app/api/projects/route.ts`

**Добавлено:**
```typescript
// Проверка прав доступа перед записью
const permissions = await checkFileSystemPermissions();
if (!permissions.canWrite) {
  return NextResponse.json({ 
    error: 'Server configuration error: cannot write to database',
    details: permissions.details // Подробная диагностика
  }, { status: 500 });
}

// Увеличенное количество попыток (3 → 5)
for (let attempt = 1; attempt <= 5; attempt++) {
  // Exponential backoff: 1s, 2s, 4s, 8s
  const waitTime = 1000 * Math.pow(2, attempt - 1);
}
```

**Улучшения:**
- 📊 Детальная диагностика файловой системы
- 🔄 Увеличено количество попыток с 3 до 5
- ⏱️ Exponential backoff между попытками
- 📝 Расширенное логирование ошибок
- 🛡️ Проверка прав доступа перед операциями
- 🔄 Улучшенная логика восстановления из backup

### 3. 🏥 Health Check Endpoint
**Файл**: `app/api/health/route.ts`

```bash
curl https://redai.site/api/health
```

**Проверяет:**
- 🗂️ Существование базы данных
- 📖 Возможность чтения файла
- ✏️ Возможность записи файла
- 📊 Количество проектов
- 🧪 Тестовые операции записи

### 4. 💾 Fallback Storage
**Файл**: `lib/fallback-storage.ts`

**Резервные механизмы:**
1. **localStorage** (для клиентской стороны)
2. **Memory storage** (временное хранение)
3. **Export/Import** проектов для ручного backup

## Инструкция по исправлению

### Шаг 1: Подключение к серверу
```bash
ssh user@redai.site
cd /path/to/redai
```

### Шаг 2: Получение исправлений
```bash
git pull origin main
```

### Шаг 3: Запуск диагностики
```bash
./scripts/server-project-save-fix.sh
```

### Шаг 4: Перезапуск сервера
```bash
# Если используется PM2
pm2 restart redai

# Если используется Docker
docker-compose restart

# Если запуск напрямую
npm run build && npm start
```

### Шаг 5: Проверка исправлений
```bash
# Тест API
curl -X POST "https://redai.site/api/projects" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","userId":"test","description":"Test"}'

# Проверка health check
curl https://redai.site/api/health
```

## Быстрый деплой

### Автоматический деплой
```bash
./scripts/deployment/deploy-projects-fix.sh
```

Этот скрипт:
1. 📤 Коммитит изменения
2. 🚀 Отправляет в репозиторий
3. 📋 Создает инструкции для сервера
4. 🧪 Тестирует API локально

### Ручное исправление прав (если автоматика не работает)
```bash
# Создать директорию базы данных
mkdir -p database

# Исправить права директории
chmod 755 database
chown $(whoami):$(id -gn) database

# Исправить права файла
chmod 644 database/projects.json
chown $(whoami):$(id -gn) database/projects.json

# Тест записи
echo "test" > database/.test && rm database/.test
```

## Мониторинг

### Логи для отслеживания
```bash
# Логи PM2
pm2 logs redai

# Логи Docker
docker-compose logs -f

# Системные логи
tail -f /var/log/nginx/error.log
```

### Индикаторы проблем
```javascript
// В консоли браузера
console.error('Save project HTTP error: 500');

// В логах сервера
console.error('POST /api/projects - Write attempt 1/5 failed:');
console.error('EACCES: permission denied');
console.error('ENOENT: no such file or directory');
```

## Альтернативные решения

### 1. Переход на PostgreSQL/Supabase
```typescript
// Замена файлового хранения на базу данных
const client = new PostgresClient(connectionString);
await client.query('INSERT INTO projects ...');
```

### 2. Использование Redis
```typescript
// Для временного хранения
const redis = new Redis(redisUrl);
await redis.setex(`project:${id}`, 3600, JSON.stringify(project));
```

### 3. S3/Object Storage
```typescript
// Для файлового хранения в облаке
const s3 = new AWS.S3();
await s3.putObject({
  Bucket: 'redai-projects',
  Key: 'projects.json',
  Body: JSON.stringify(projects)
}).promise();
```

## Профилактика

### Регулярные проверки
```bash
# Еженедельная диагностика (добавить в cron)
0 9 * * 1 /path/to/redai/scripts/server-project-save-fix.sh

# Мониторинг места на диске
df -h

# Проверка прав доступа
ls -la database/
```

### Backup стратегия
```bash
# Автоматический backup базы данных
cp database/projects.json database/projects.json.backup.$(date +%Y%m%d)

# Очистка старых backup (оставить 7 дней)
find database/ -name "projects.json.backup.*" -mtime +7 -delete
```

## Ожидаемые результаты

### ✅ После исправления:
- Проекты сохраняются без ошибок 500
- В логах появляются успешные записи
- Health check показывает `"status": "healthy"`
- Пользователи могут сохранять дизайны

### 📊 Метрики успеха:
- **Успешность сохранения**: >99%
- **Время отклика API**: <2 секунды
- **Количество retry попыток**: Снижается до 1
- **Ошибки 500**: Устраняются полностью

## Контакты и поддержка

При возникновении проблем:
1. 🔍 Запустить `./scripts/server-project-save-fix.sh`
2. 🏥 Проверить `curl https://redai.site/api/health`
3. 📋 Изучить логи сервера
4. 📧 Обратиться с подробной диагностикой

**Дата создания**: {{ current_date }}
**Версия исправлений**: 1.0
**Статус**: Готово к деплою 