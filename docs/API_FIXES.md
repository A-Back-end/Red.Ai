# Исправления API генерации изображений

## Проблемы, которые были исправлены

### 1. Ошибка 400 Bad Request при генерации

**Проблема:** API возвращал 400 Bad Request из-за неправильной валидации polling URL.

**Причина:** Функция `isValidBflUrl` в check-status API была слишком строгой и не принимала новые домены BFL.ai.

**Решение:** Обновлен список разрешенных доменов и улучшена валидация URL.

### 2. Ошибка "Invalid polling URL format"

**Проблема:** FluxDesigner получал ошибку "Invalid polling URL format" при попытке проверить статус генерации.

**Причина:** API генерации возвращал URL с доменом `api.eu4.bfl.ai`, который не был в списке разрешенных.

**Решение:** Добавлен домен `api.eu4.bfl.ai` в список валидных хостов.

## Исправленные файлы

### 1. `app/api/check-status/route.ts`

**Изменения:**
- Обновлен список разрешенных доменов
- Добавлено логирование для отладки валидации URL
- Улучшена обработка ошибок

```typescript
const validHosts = ['api.bfl.ai', 'api.eu1.bfl.ai', 'api.us1.bfl.ai', 'api.eu4.bfl.ai'];
```

### 2. `app/api/generate-design/route.ts`

**Изменения:**
- Добавлена строгая валидация polling URL
- Улучшена обработка ошибок с детальными сообщениями
- Добавлена проверка формата URL перед возвратом ответа

```typescript
// Validate that it's a BFL.ai URL
try {
  const urlObj = new URL(responseData.polling_url);
  const validHosts = ['api.bfl.ai', 'api.eu1.bfl.ai', 'api.us1.bfl.ai', 'api.eu4.bfl.ai'];
  if (!validHosts.includes(urlObj.hostname)) {
    // Return error with details
  }
} catch (urlError) {
  // Return error with details
}
```

### 3. `components/dashboard/FluxDesigner.tsx`

**Изменения:**
- Улучшена обработка ошибок API
- Добавлено логирование для отладки
- Более детальные сообщения об ошибках

```typescript
if (!response.ok) {
  console.error('[FluxDesigner] API error response:', data);
  throw new Error(data.message || `Failed to start generation (${response.status}).`);
}

if (!data.polling_url) {
  console.error('[FluxDesigner] No polling URL in response:', data);
  throw new Error('Invalid response from server: missing polling URL.');
}
```

## Новые функции

### Тестовая страница `/test-generation`

Создана тестовая страница для проверки работы API генерации:

- Простой интерфейс для тестирования
- Отображение статуса генерации
- Показ результата и ошибок
- Отладка polling URL

## Валидация URL

### Разрешенные домены BFL.ai:
- `api.bfl.ai` - основной домен
- `api.eu1.bfl.ai` - европейский регион 1
- `api.us1.bfl.ai` - американский регион 1
- `api.eu4.bfl.ai` - европейский регион 4 (новый)

### Формат polling URL:
```
https://api.{region}.bfl.ai/v1/get_result?id={generation_id}
```

## Тестирование

### 1. Тест API генерации:
```bash
curl -X POST http://localhost:3001/api/generate-design \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test prompt"}' | jq .
```

### 2. Тест check-status API:
```bash
curl "http://localhost:3001/api/check-status?url=https://api.us1.bfl.ai/v1/get_result?id=test-id" | jq .
```

### 3. Тест через веб-интерфейс:
Перейдите на `/test-generation` для интерактивного тестирования.

## Логирование

Добавлено подробное логирование для отладки:

- `[Generate API]` - логи API генерации
- `[Check Status API]` - логи API проверки статуса
- `[FluxDesigner]` - логи компонента FluxDesigner

## Обработка ошибок

### Типы ошибок:
1. **Missing API Key** - отсутствует BFL_API_KEY
2. **Invalid URL Format** - неправильный формат polling URL
3. **Invalid Hostname** - неразрешенный домен
4. **Network Errors** - сетевые ошибки
5. **Generation Timeout** - превышение времени ожидания

### Сообщения об ошибках:
- Детальные сообщения для разработчиков
- Пользовательские сообщения для интерфейса
- Логирование для отладки

## Мониторинг

### Метрики для отслеживания:
- Количество успешных генераций
- Количество ошибок по типам
- Время генерации
- Статусы polling

### Аналитика:
Все события генерации отслеживаются через `clerkAnalytics`:
- `image_generation_started` - начало генерации
- `image_generation_completed` - завершение генерации
- `image_generation_failed` - ошибка генерации

## Переменные окружения

Убедитесь, что установлены:

```env
BFL_API_KEY=your_bfl_api_key_here
```

## Рекомендации

1. **Мониторинг:** Регулярно проверяйте логи на наличие ошибок
2. **Обновления:** Следите за новыми доменами BFL.ai
3. **Тестирование:** Используйте тестовую страницу для проверки API
4. **Fallback:** Рассмотрите добавление fallback API для надежности 