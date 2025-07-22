# Исправление API Projects - 500 Internal Server Error

## 🐛 Проблема

Ошибка: `POST http://localhost:3000/api/projects 500 (Internal Server Error)`

**Причина**: В Docker контейнере отсутствовала директория `/app/database/`, что приводило к ошибке `ENOENT: no such file or directory, open '/app/database/projects.json'`

## 🔧 Решение

### 1. Добавление database volume в docker-compose файлы

#### docker-compose.dev.yml
```yaml
frontend:
  volumes:
    - ./app:/app/app
    - ./components:/app/components
    - ./lib:/app/lib
    - ./public:/app/public
    - ./utils:/app/utils
    - ./services:/app/services
    - ./pages:/app/pages
    - ./database:/app/database  # ← Добавлено
```

#### docker-compose.yml
```yaml
frontend:
  volumes:
    - ./src/frontend:/app/src/frontend
    - ./public:/app/public
    - ./database:/app/database  # ← Добавлено
```

#### docker-compose.yml.bak
```yaml
frontend:
  volumes:
    - ./src/frontend:/app/src/frontend
    - ./public:/app/public
    - ./database:/app/database  # ← Добавлено
```

### 2. Перезапуск контейнера

```bash
# Остановка frontend контейнера
docker-compose -f docker-compose.dev.yml down frontend

# Запуск с новыми volumes
docker-compose -f docker-compose.dev.yml up -d frontend
```

## ✅ Результат

### API Projects теперь работает:

#### Создание проекта (POST)
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "description": "Test description", "userId": "test-user"}'

# Ответ:
{
  "success": true,
  "project": {
    "id": "project_1753169047724_33yr6l12s",
    "userId": "test-user",
    "name": "Test Project",
    "description": "Test description",
    "createdAt": "2025-07-22T07:24:07.724Z",
    "updatedAt": "2025-07-22T07:24:07.724Z",
    "status": "draft",
    "generatedImages": [],
    "budget": {
      "min": 50000,
      "max": 200000
    },
    "preferredStyles": ["modern"],
    "restrictions": [],
    "roomAnalysis": null,
    "designRecommendation": null,
    "threeDModel": null,
    "pdfReport": null,
    "shoppingList": null
  }
}
```

#### Получение проектов (GET)
```bash
curl "http://localhost:3000/api/projects?userId=test-user"

# Ответ:
{
  "success": true,
  "projects": [
    {
      "id": "project_1753169047724_33yr6l12s",
      "userId": "test-user",
      "name": "Test Project",
      "description": "Test description",
      // ... остальные поля
    }
  ]
}
```

## 🔍 Диагностика

### Проверка доступности database в контейнере:
```bash
# Проверка директории
docker-compose -f docker-compose.dev.yml exec frontend ls -la /app/database/

# Результат:
total 12
drwxr-xr-x    3 nextjs   nogroup         96 Jul 16 06:06 .
drwxr-xr-x    1 nextjs   nodejs        4096 Jul 22 07:23 ..
-rw-r--r-x    1 nextjs   nogroup       6470 Jul 22 06:36 projects.json
```

### Проверка логов:
```bash
# Просмотр логов frontend
docker-compose -f docker-compose.dev.yml logs frontend --tail=20
```

## 📁 Структура файлов

```
Red.Ai/
├── database/
│   └── projects.json          # JSON база данных проектов
├── app/
│   └── api/
│       └── projects/
│           └── route.ts       # API endpoint для проектов
├── docker-compose.dev.yml     # ← Обновлен с database volume
├── docker-compose.yml         # ← Обновлен с database volume
└── docker-compose.yml.bak     # ← Обновлен с database volume
```

## 🎯 Функциональность API Projects

### Поддерживаемые операции:

1. **POST /api/projects** - Создание нового проекта
2. **GET /api/projects?userId=X** - Получение проектов пользователя
3. **GET /api/projects?projectId=X** - Получение конкретного проекта
4. **PUT /api/projects** - Обновление проекта
5. **DELETE /api/projects?projectId=X** - Удаление проекта

### Структура проекта:
```typescript
interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'in_progress' | 'completed';
  generatedImages: string[];
  budget: { min: number; max: number };
  preferredStyles: string[];
  restrictions: string[];
  roomAnalysis: any;
  designRecommendation: any;
  threeDModel: any;
  pdfReport: any;
  shoppingList: any;
}
```

## 🚀 Теперь можно:

- ✅ **Создавать проекты** через фронтенд
- ✅ **Сохранять дизайны** в проекты
- ✅ **Просматривать историю** проектов
- ✅ **Обновлять проекты** с новыми данными
- ✅ **Удалять проекты** при необходимости

## 📝 Примечания

- **Database volume** теперь подключен во всех docker-compose файлах
- **JSON файл** используется как простое хранилище данных
- **Автоматическое создание** директории при первом запуске
- **Совместимость** с Docker и локальной разработкой

**🎉 API Projects полностью исправлен и работает!** 