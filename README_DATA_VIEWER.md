# 🔍 Просмотр данных Red.AI

## Быстрый старт

### Запуск интерактивного просмотрщика

```bash
# Запуск из корня проекта
node scripts/view-data.js

# Или с правами на выполнение
./scripts/view-data.js
```

### Что можно просмотреть

1. **📊 Проекты пользователей** - статистика и детали проектов
2. **💾 Резервные копии** - история изменений базы данных
3. **🖼️ Изображения** - файлы в различных директориях
4. **📝 Логи** - системные логи и ошибки
5. **⚙️ Конфигурация** - настройки приложения

## Альтернативные способы просмотра

### Прямой просмотр JSON базы данных

```bash
# Просмотр всех проектов
cat database/projects.json | jq '.'

# Подсчет проектов
cat database/projects.json | jq '. | length'

# Последние 5 проектов
cat database/projects.json | jq 'sort_by(.createdAt) | reverse | .[0:5]'

# Статистика по статусам
cat database/projects.json | jq 'group_by(.status) | map({status: .[0].status, count: length})'
```

### Просмотр логов

```bash
# Основной лог
tail -f logs/app.log

# Backend лог
tail -f backend/logs/red_ai.log

# Docker логи
docker-compose logs -f backend
```

### Просмотр изображений

```bash
# Подсчет файлов в директориях
find public/uploads -name "*.jpg" -o -name "*.png" | wc -l
find public/generated-images -name "*.jpg" -o -name "*.png" | wc -l

# Размер директорий
du -sh public/uploads public/generated-images
```

### Проверка конфигурации

```bash
# Переменные окружения
env | grep -E "(AZURE|BFL|AWS|CLERK)"

# Docker контейнеры
docker-compose ps

# Диски и volumes
docker system df
```

## API для просмотра данных

### Получение проектов

```bash
# Все проекты
curl http://localhost:3000/api/projects

# Проекты конкретного пользователя
curl "http://localhost:3000/api/projects?userId=user_123"
```

### Анализ изображений

```bash
# Проверка временных URL
curl http://localhost:3000/api/update-project-images
```

### Статус системы

```bash
# Проверка здоровья API
curl http://localhost:3000/api/health

# Статус backend
curl http://localhost:8000/health
```

## Полезные команды

### Очистка данных

```bash
# Удаление старых логов
find logs -name "*.log" -mtime +7 -delete

# Очистка временных файлов
rm -rf backend/uploads/* backend/generated-images/*

# Очистка Docker
docker system prune -f
```

### Резервное копирование

```bash
# Создание бэкапа проектов
cp database/projects.json database/projects.json.backup.$(date +%s)

# Экспорт в JSON
cat database/projects.json | jq '.' > backup_$(date +%Y%m%d_%H%M%S).json
```

### Мониторинг

```bash
# Мониторинг использования диска
watch -n 5 'df -h && echo "---" && du -sh database public/uploads public/generated-images'

# Мониторинг логов в реальном времени
tail -f logs/app.log | grep -E "(ERROR|WARN|INFO)"
```

## Структура данных

### Проект (JSON)

```json
{
  "id": "project_123",
  "userId": "user_456",
  "name": "Название проекта",
  "description": "Описание",
  "imageUrl": "https://...",
  "createdAt": "2025-01-20T10:00:00Z",
  "updatedAt": "2025-01-20T10:00:00Z",
  "status": "completed",
  "generatedImages": ["https://..."],
  "budget": {
    "min": 25000,
    "max": 37500,
    "currency": "RUB"
  },
  "preferredStyles": ["scandinavian"]
}
```

### Директории файлов

```
Red.Ai/
├── database/
│   ├── projects.json              # Основная база данных
│   └── projects.json.backup.*     # Резервные копии
├── public/
│   ├── uploads/                   # Загруженные изображения
│   └── generated-images/          # Сгенерированные изображения
├── backend/
│   ├── uploads/                   # Временные файлы backend
│   └── generated-images/          # Сгенерированные backend
└── logs/
    └── app.log                    # Основной лог
```

## Устранение неполадок

### Проблемы с доступом к данным

```bash
# Проверка прав доступа
ls -la database/projects.json
ls -la public/uploads/

# Исправление прав
chmod 644 database/projects.json
chmod -R 755 public/uploads/
```

### Проблемы с JSON

```bash
# Проверка валидности JSON
cat database/projects.json | jq '.' > /dev/null

# Исправление поврежденного JSON
cp database/projects.json.backup.* database/projects.json
```

### Проблемы с Docker

```bash
# Перезапуск контейнеров
docker-compose down && docker-compose up -d

# Просмотр логов контейнеров
docker-compose logs backend
```

Этот инструмент поможет вам эффективно управлять и анализировать данные в проекте Red.AI. 