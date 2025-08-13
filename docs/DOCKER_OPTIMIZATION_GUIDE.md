# Руководство по оптимизации Docker для Red.AI

## Проблема: "no space left on device"

Эта ошибка возникает, когда Docker исчерпывает доступное место на диске. В нашем случае было освобождено **21.35GB** места.

## Решение проблемы

### 1. Немедленная очистка

```bash
# Комплексная очистка всех неиспользуемых ресурсов
docker system prune -af --volumes

# Результат: освобождено 21.35GB места
```

### 2. Анализ использования диска

```bash
# Показать использование Docker
docker system df

# Показать место на диске
df -h /

# Показать крупнейшие образы
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | head -10
```

## Оптимизированная конфигурация

### docker-compose-server-optimized.yml

Создан оптимизированный файл с:
- **Строгими лимитами ресурсов**
- **Health checks** для всех сервисов
- **BuildKit cache** для ускорения сборки
- **Alpine образы** где возможно

#### Лимиты ресурсов:
- **Backend**: 512MB RAM, 0.25 CPU
- **AI Processor**: 1GB RAM, 0.5 CPU
- **PostgreSQL**: 256MB RAM, 0.1 CPU
- **Redis**: 128MB RAM, 0.05 CPU

### Запуск оптимизированной версии:

```bash
# Запуск с оптимизированной конфигурацией
docker-compose -f docker-compose-server-optimized.yml up -d --build

# Проверка статуса
docker-compose -f docker-compose-server-optimized.yml ps

# Проверка API
curl http://localhost:8000/health
curl http://localhost:8001/health
```

## Рекомендации по предотвращению

### 1. Регулярное обслуживание

```bash
# Запуск скрипта обслуживания (еженедельно)
./scripts/docker-maintenance.sh
```

### 2. Оптимизация Dockerfile

#### Используйте многоступенчатые сборки:
```dockerfile
# Builder stage
FROM python:3.11-slim AS builder
RUN python -m venv /opt/venv
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim AS production
COPY --from=builder /opt/venv /opt/venv
# Только необходимые файлы
```

#### Используйте легковесные базовые образы:
- `python:3.11-slim` вместо `python:3.11`
- `postgres:15-alpine` вместо `postgres:15`
- `redis:7-alpine` вместо `redis:7`

### 3. Оптимизация .dockerignore

Убедитесь, что `.dockerignore` исключает:
- `node_modules/`
- `__pycache__/`
- `.venv/`
- `logs/`
- `.git/`
- `*.log`
- `uploads/`
- `generated-images/`

### 4. Мониторинг использования ресурсов

```bash
# Мониторинг в реальном времени
docker stats

# Проверка размера образов
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Проверка использования volumes
docker volume ls
```

### 5. Автоматическая очистка

#### Настройка cron job для автоматической очистки:

```bash
# Добавить в crontab (еженедельно по воскресеньям в 2:00)
0 2 * * 0 /path/to/Red.Ai/scripts/docker-maintenance.sh >> /var/log/docker-maintenance.log 2>&1
```

#### Создание systemd service (для systemd систем):

```ini
# /etc/systemd/system/docker-maintenance.service
[Unit]
Description=Docker Maintenance Service
After=docker.service

[Service]
Type=oneshot
ExecStart=/path/to/Red.Ai/scripts/docker-maintenance.sh
User=azureuser

[Install]
WantedBy=multi-user.target
```

```ini
# /etc/systemd/system/docker-maintenance.timer
[Unit]
Description=Run Docker maintenance weekly
Requires=docker-maintenance.service

[Timer]
OnCalendar=weekly
Persistent=true

[Install]
WantedBy=timers.target
```

### 6. Настройка Docker daemon

#### Оптимизация настроек Docker:

```json
# /etc/docker/daemon.json
{
  "storage-driver": "overlay2",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-ulimits": {
    "nofile": {
      "Hard": 64000,
      "Name": "nofile",
      "Soft": 64000
    }
  }
}
```

### 7. Мониторинг дискового пространства

#### Настройка алертов:

```bash
# Скрипт для проверки места на диске
#!/bin/bash
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "WARNING: Disk usage is ${DISK_USAGE}%" | mail -s "Disk Space Alert" admin@example.com
fi
```

## Полезные команды

### Очистка по типам ресурсов:

```bash
# Контейнеры
docker container prune -f

# Образы
docker image prune -af

# Volumes
docker volume prune -f

# Networks
docker network prune -f

# Build cache
docker builder prune -af
```

### Анализ использования:

```bash
# Детальная информация об использовании
docker system df -v

# История команд
docker history <image_name>

# Размер слоев образа
docker image inspect <image_name> --format='{{.Size}}'
```

### Экспорт/импорт для экономии места:

```bash
# Сохранение образа в tar
docker save <image_name> | gzip > image.tar.gz

# Загрузка образа из tar
gunzip -c image.tar.gz | docker load
```

## Мониторинг производительности

### Метрики для отслеживания:

1. **Использование диска**: `df -h`
2. **Использование Docker**: `docker system df`
3. **Использование памяти**: `docker stats`
4. **Количество образов**: `docker images | wc -l`
5. **Количество контейнеров**: `docker ps -a | wc -l`

### Рекомендуемые пороги:

- **Дисковое пространство**: < 80%
- **Docker images**: < 50 образов
- **Docker containers**: < 20 контейнеров
- **Build cache**: < 5GB

## Заключение

Регулярное обслуживание Docker критически важно для предотвращения проблем с местом на диске. Используйте предоставленные скрипты и рекомендации для поддержания оптимальной производительности системы. 