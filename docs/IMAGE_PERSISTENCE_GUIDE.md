# Руководство по системе постоянного сохранения изображений

## Обзор

Система автоматически сохраняет сгенерированные изображения локально, чтобы они не исчезали после истечения временных URL от внешних API (DALL-E, BFL.ai, etc.).

## Как это работает

### 1. Автоматическое сохранение при создании проекта

При создании нового проекта в `DesignStudio` система автоматически:
- Проверяет, является ли URL изображения временным
- Скачивает изображение и сохраняет его в `public/generated-images/`
- Обновляет проект в базе данных с постоянным локальным URL

### 2. Доступные API endpoints

#### `/api/save-image` (POST)
Скачивает изображение по URL и сохраняет его локально.

**Запрос:**
```json
{
  "imageUrl": "https://example.com/image.png",
  "filename": "custom-name.png" // опционально
}
```

**Ответ:**
```json
{
  "success": true,
  "originalUrl": "https://example.com/image.png",
  "localUrl": "/generated-images/custom-name.png",
  "filename": "custom-name.png",
  "message": "Image downloaded and saved successfully"
}
```

#### `/api/update-project-images` (GET)
Анализирует проекты и показывает, сколько имеют временные URL.

**Ответ:**
```json
{
  "success": true,
  "message": "Project analysis completed",
  "totalProjects": 5,
  "temporaryProjects": 2,
  "projectsToUpdate": [
    {
      "id": "project_123",
      "name": "Project Name",
      "imageUrl": "https://temporary-url.com/image.png",
      "isTemporary": true
    }
  ]
}
```

#### `/api/update-project-images?action=update-all` (GET)
Массово обновляет все проекты с временными URL.

**Ответ:**
```json
{
  "success": true,
  "message": "Mass update completed",
  "results": {
    "updated": 3,
    "failed": 1
  }
}
```

#### `/api/update-project-images` (POST)
Обновляет конкретный проект.

**Запрос:**
```json
{
  "projectId": "project_123",
  "imageUrl": "https://temporary-url.com/image.png"
}
```

### 3. Админ-панель для управления изображениями

Доступна по адресу: `/admin/image-manager`

**Функции:**
- Просмотр статистики проектов
- Массовое обновление всех проектов
- Обновление отдельных проектов
- Просмотр проектов с временными URL

## Использование

### Для разработчиков

```typescript
import { downloadAndSaveImage, isTemporaryUrl } from '@/utils/imageUtils'

// Проверить, является ли URL временным
if (isTemporaryUrl(imageUrl)) {
  // Сохранить изображение локально
  const result = await downloadAndSaveImage(imageUrl)
  if (result.success) {
    // Использовать result.localUrl
  }
}
```

### Для пользователей

1. **Создание проектов**: Изображения автоматически сохраняются при создании проектов
2. **Админ-панель**: Используйте `/admin/image-manager` для управления существующими проектами
3. **PDF отчеты**: Теперь всегда содержат актуальные изображения

## Структура файлов

```
public/
  generated-images/           # Постоянное хранение изображений
    saved-image-123.png
    dalle3-modern-living-room-456.png
    test-image.jpg

utils/
  imageUtils.ts              # Утилиты для работы с изображениями

app/api/
  save-image/route.ts        # API для скачивания изображений
  update-project-images/     # API для обновления проектов
    route.ts

components/admin/
  ImageManager.tsx           # Админ-панель для управления изображениями
```

## Конфигурация

### Поддерживаемые временные домены

Система автоматически определяет временные URL от:
- `delivery-eu1.bfl.ai`
- `oaidalleapiprodscus.blob.core.windows.net`
- `cdn.openai.com`
- `dalle-images.com`
- URL с параметрами `?se=` или `?expires=`

### Настройки

```typescript
// В utils/imageUtils.ts
const temporaryDomains = [
  'delivery-eu1.bfl.ai',
  'oaidalleapiprodscus.blob.core.windows.net',
  // Добавьте другие домены при необходимости
]
```

## Безопасность

- Изображения сохраняются в `public/generated-images/` (публично доступны)
- Уникальные имена файлов предотвращают конфликты
- Таймаут 30 секунд для скачивания изображений
- Проверка типов файлов

## Мониторинг

Логи системы включают:
- `🔄 Starting image download process`
- `✅ Image saved successfully`
- `❌ Error downloading image`
- `📂 Old URL: ... New URL: ...`

## Устранение неполадок

### Проблема: Изображения не скачиваются

**Решение:**
1. Проверьте, что URL доступен
2. Убедитесь, что папка `public/generated-images/` существует
3. Проверьте права доступа к файловой системе

### Проблема: API возвращает 404

**Решение:**
1. Убедитесь, что сервер запущен
2. Проверьте правильность путей к файлам
3. Проверьте импорты в API endpoints

### Проблема: Массовое обновление не работает

**Решение:**
1. Проверьте, что все временные URL все еще действительны
2. Используйте админ-панель для просмотра деталей ошибок
3. Обновляйте проекты по одному для диагностики

## Планы развития

- [ ] Поддержка других форматов изображений
- [ ] Автоматическое сжатие изображений
- [ ] Резервное копирование в облако
- [ ] Уведомления о истекающих URL
- [ ] Batch API для массовых операций 