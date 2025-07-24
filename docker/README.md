# Docker Configuration

Эта папка содержит все Docker конфигурации для проекта Red.AI.

## Структура папок

```
docker/
├── compose/          # Docker Compose файлы
│   ├── docker-compose.yml              # Основной compose файл
│   ├── docker-compose.dev.yml          # Development окружение
│   ├── docker-compose.prod.yml         # Production окружение
│   ├── docker-compose.simple.yml       # Простая конфигурация
│   ├── docker-compose-redai-prod.yml   # Production для redai.site
│   ├── docker-compose-root.yml         # Root конфигурация
│   └── docker-compose.yml.bak          # Резервная копия
├── configs/          # Конфигурационные файлы
│   ├── nginx.conf                     # Основной nginx конфиг
│   ├── nginx-redai.conf               # Nginx для redai.site
│   ├── nginx-redai-fixed.conf         # Исправленный nginx
│   ├── nginx-redai-no-ssl.conf        # Nginx без SSL
│   ├── nginx-temp.conf                # Временный nginx
│   ├── nginx.prod.conf                # Production nginx
│   └── prometheus.yml                 # Prometheus конфигурация
├── Dockerfiles/      # Dockerfile'ы
│   ├── Dockerfile.backend             # Backend контейнер
│   ├── Dockerfile.backend.lightweight # Легковесный backend
│   ├── Dockerfile.frontend            # Frontend контейнер
│   ├── Dockerfile.frontend.dev        # Development frontend
│   ├── Dockerfile.frontend-root       # Root frontend
│   └── Dockerfile.ai-processor        # AI процессор
└── ssl/              # SSL сертификаты
```

## Использование

### Development
```bash
# Запуск development окружения
docker-compose -f docker/compose/docker-compose.dev.yml up

# Запуск простой конфигурации
docker-compose -f docker/compose/docker-compose.simple.yml up
```

### Production
```bash
# Запуск production окружения
docker-compose -f docker/compose/docker-compose.prod.yml up -d

# Запуск для redai.site
docker-compose -f docker/compose/docker-compose-redai-prod.yml up -d
```

### Основной compose
```bash
# Запуск полного стека
docker-compose -f docker/compose/docker-compose.yml up -d
```

## Конфигурации

### Nginx
- `nginx.conf` - Основная конфигурация
- `nginx-redai.conf` - Специальная конфигурация для redai.site
- `nginx-redai-fixed.conf` - Исправленная версия
- `nginx-redai-no-ssl.conf` - Без SSL для разработки

### Prometheus
- `prometheus.yml` - Конфигурация мониторинга

## Dockerfile'ы

### Backend
- `Dockerfile.backend` - Полный backend с Python
- `Dockerfile.backend.lightweight` - Легковесная версия

### Frontend
- `Dockerfile.frontend` - Production frontend
- `Dockerfile.frontend.dev` - Development версия
- `Dockerfile.frontend-root` - Root версия

### AI Processor
- `Dockerfile.ai-processor` - Специальный контейнер для AI обработки

## Переменные окружения

Все compose файлы используют переменные окружения из `.env` файла. Убедитесь, что у вас настроены:

- `OPENAI_API_KEY`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_ENDPOINT`
- `BFL_API_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

## Мониторинг

Prometheus доступен на порту 9090 для мониторинга контейнеров.

## SSL

SSL сертификаты хранятся в папке `ssl/` и автоматически обновляются через certbot в production окружении. 