# Настройка BFL API ключа

## Проблема
Ошибка: `BFL API key is not configured. Please set BFL_API_KEY environment variable`

## Решение

### 1. Добавление BFL_API_KEY в docker-compose файлы

Добавлен `BFL_API_KEY` во все сервисы в docker-compose файлах:

#### docker-compose.yml
```yaml
# Frontend сервис
frontend:
  environment:
    - BFL_API_KEY=${BFL_API_KEY:-}

# AI Processor сервис  
ai-processor:
  environment:
    - BFL_API_KEY=${BFL_API_KEY:-}
```

#### docker-compose.dev.yml
```yaml
# Backend сервис
backend:
  environment:
    - BFL_API_KEY=${BFL_API_KEY:-}

# Frontend сервис
frontend:
  environment:
    - BFL_API_KEY=${BFL_API_KEY:-}

# AI Processor сервис
ai-processor:
  environment:
    - BFL_API_KEY=${BFL_API_KEY:-}
```

#### docker-compose.yml.bak
```yaml
# Frontend сервис
frontend:
  environment:
    - BFL_API_KEY=${BFL_API_KEY:-}

# AI Processor сервис
ai-processor:
  environment:
    - BFL_API_KEY=${BFL_API_KEY:-}
```

### 2. Переменная окружения в .env.local

Убедитесь, что в файле `.env.local` есть:
```env
# ==================== BFL API ====================
BFL_API_KEY=501cf430-f9d9-445b-9b60-1949650f352a
```

### 3. Перезапуск сервера

После изменения docker-compose файлов необходимо перезапустить сервер:
```bash
# Остановить сервер
pkill -f next-server

# Запустить заново
npm run dev
```

## Проверка работы

### Тест генерации дизайна
```bash
curl -X POST http://localhost:3000/api/generate-design \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "style": "modern", "roomType": "living-room", "temperature": "SketchUp"}' \
  | jq -r '.polling_url'
```

### Тест проверки статуса
```bash
curl "http://localhost:3000/api/check-status?url=https://api.us1.bfl.ai/v1/get_result?id=YOUR_ID"
```

## Результат

✅ **BFL API ключ настроен** во всех сервисах  
✅ **Генерация дизайна работает**  
✅ **Проверка статуса работает**  
✅ **Полный цикл генерации** функционирует корректно  

## Файлы изменены

1. **docker-compose.yml** - Добавлен BFL_API_KEY в frontend и ai-processor
2. **docker-compose.dev.yml** - Добавлен BFL_API_KEY во все сервисы
3. **docker-compose.yml.bak** - Добавлен BFL_API_KEY в frontend и ai-processor

## Примечания

- BFL_API_KEY уже был настроен в `.env.local`
- Проблема была в том, что переменная не передавалась в Docker контейнеры
- Теперь все сервисы имеют доступ к BFL API ключу
- Конфигурация работает как для разработки, так и для продакшена 