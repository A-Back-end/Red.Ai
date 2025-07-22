# 🔧 Исправление API Projects на сервере RedAI

## Проблема
POST запрос на `https://redai.site/api/projects` возвращает ошибку 500 (Internal Server Error).

## Причина
В конфигурации nginx все `/api/` запросы проксируются на backend (FastAPI), но API endpoint `/api/projects` находится в Next.js приложении (frontend).

## Решение

### 1. Обновление конфигурации nginx

Создана исправленная конфигурация `nginx-redai-fixed.conf`, которая:
- Проксирует `/api/projects` на frontend (Next.js)
- Проксирует остальные `/api/` запросы на backend (FastAPI)

### 2. Развертывание исправления

#### Вариант A: Через Docker Compose (рекомендуется)
```bash
# Остановить текущие контейнеры
docker-compose -f docker-compose.prod.yml down

# Запустить с новой конфигурацией
docker-compose -f docker-compose.prod.yml up -d
```

#### Вариант B: Ручное обновление nginx
```bash
# Скопировать исправленную конфигурацию
sudo cp nginx-redai-fixed.conf /etc/nginx/nginx.conf

# Проверить конфигурацию
sudo nginx -t

# Перезагрузить nginx
sudo nginx -s reload
```

#### Вариант C: Использовать автоматический скрипт
```bash
# Запустить скрипт исправления
./fix-nginx-config.sh
```

### 3. Проверка исправления

#### Тест через curl
```bash
curl -X POST https://redai.site/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","description":"Test","userId":"test-user"}'
```

#### Тест через Node.js
```bash
node test-projects-api.js
```

### 4. Ожидаемый результат

После исправления API должен возвращать:
```json
{
  "success": true,
  "project": {
    "id": "project_1234567890_abc123",
    "name": "Test Project",
    "description": "Test",
    "userId": "test-user",
    "createdAt": "2025-07-22T11:43:43.332Z",
    "updatedAt": "2025-07-22T11:43:43.332Z",
    "status": "draft",
    "budget": {
      "min": 50000,
      "max": 200000,
      "currency": "RUB"
    },
    "preferredStyles": ["modern"],
    "restrictions": [],
    "generatedImages": [],
    "roomAnalysis": null,
    "designRecommendation": null,
    "threeDModel": null,
    "pdfReport": null,
    "shoppingList": null
  }
}
```

## Файлы изменений

1. `nginx-redai-fixed.conf` - исправленная конфигурация nginx
2. `docker-compose.prod.yml` - обновлен для использования новой конфигурации
3. `fix-nginx-config.sh` - автоматический скрипт исправления
4. `app/api/projects/route.ts` - улучшен с детальным логированием и валидацией

## Логирование

API endpoint теперь включает детальное логирование:
- Все входящие запросы
- Валидация данных
- Ошибки с деталями
- Успешные операции

Логи можно найти в консоли Next.js сервера.

## Откат изменений

В случае проблем можно откатиться к предыдущей конфигурации:
```bash
# Восстановить backup конфигурации nginx
sudo cp /etc/nginx/nginx.conf.backup.* /etc/nginx/nginx.conf

# Перезагрузить nginx
sudo nginx -s reload
``` 