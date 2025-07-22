# Решение Git конфликта на сервере

## 🐛 Проблема

На сервере возник merge conflict в `docker-compose.yml` при выполнении `git pull`:

```
Auto-merging docker-compose.yml
CONFLICT (content): Merge conflict in docker-compose.yml
Automatic merge failed; fix conflicts and then commit the result.
```

## 🔧 Решение

### Шаг 1: Посмотреть конфликт
```bash
# На сервере выполните:
git status
```

### Шаг 2: Открыть файл с конфликтом
```bash
nano docker-compose.yml
```

### Шаг 3: Найти и исправить конфликт

В файле будут маркеры конфликта:
```
<<<<<<< HEAD
# Локальные изменения
=======
# Удаленные изменения
>>>>>>> origin/main
```

### Шаг 4: Заменить весь файл на правильную версию

Замените весь содержимое `docker-compose.yml` на:

```yaml
services:

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: redai_postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-redai}
      POSTGRES_USER: ${POSTGRES_USER:-redai_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-redai_password}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-redai_user} -d ${POSTGRES_DB:-redai}"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: redai_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Backend API
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
    container_name: redai_backend
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER:-redai_user}:${POSTGRES_PASSWORD:-redai_password}@postgres:5432/${POSTGRES_DB:-redai}
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=${SECRET_KEY:-your-secret-key-here}
      - OPENAI_API_KEY=${OPENAI_API_KEY:-}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
      - AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY:-}
      - AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT:-}
      - OPENAI_API_VERSION=${OPENAI_API_VERSION:-2024-02-01}
      - BFL_API_KEY=${BFL_API_KEY:-}
      - DEBUG=${DEBUG:-false}
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app/backend
      - ./src:/app/src
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Frontend App
  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
      args:
        - OPENAI_API_KEY=${OPENAI_API_KEY:-placeholder_for_build}
        - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:-pk_test_YOUR_CLERK_PUBLISHABLE_KEY_HERE}
    container_name: redai_frontend
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:8000}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-http://localhost:3000}
      - OPENAI_API_KEY=${OPENAI_API_KEY:-}
      - AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY:-}
      - AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT:-}
      - OPENAI_API_VERSION=${OPENAI_API_VERSION:-2024-02-01}
      - BFL_API_KEY=${BFL_API_KEY:-}
    ports:
      - "3000:3000"
    volumes:
      - ./app:/app/app
      - ./components:/app/components
      - ./lib:/app/lib
      - ./public:/app/public
      - ./utils:/app/utils
      - ./services:/app/services
      - ./pages:/app/pages
      - ./database:/app/database
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  # AI Processing Service
  ai-processor:
    build:
      context: .
      dockerfile: docker/Dockerfile.ai-processor
    environment:
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY:-}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
      - HUGGINGFACE_API_KEY=${HUGGINGFACE_API_KEY:-}
      - AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY:-}
      - AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT:-}
      - OPENAI_API_VERSION=${OPENAI_API_VERSION:-2024-02-01}
      - BFL_API_KEY=${BFL_API_KEY:-}
    volumes:
      - ./src/ai_models:/app/src/ai_models
      - ./backend:/app/backend
      - ./uploads:/app/uploads
    depends_on:
      redis:
        condition: service_healthy
    deploy:
      replicas: 2

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: redai_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/ssl:/etc/nginx/ssl
      - ./static:/var/www/static
    depends_on:
      - frontend
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Monitoring - Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: redai_prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./docker/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

volumes:
  postgres_data:
  redis_data:
  prometheus_data:

networks:
  default:
    name: redai_network
    driver: bridge
```

### Шаг 5: Сохранить файл и завершить merge
```bash
# Сохранить файл (в nano: Ctrl+X, затем Y, затем Enter)

# Добавить исправленный файл
git add docker-compose.yml

# Завершить merge
git commit -m "Resolve merge conflict in docker-compose.yml"

# Проверить статус
git status
```

### Шаг 6: Перезапустить Docker
```bash
# Остановить контейнеры
docker-compose down

# Запустить с новыми изменениями
./start-docker-prod.sh

# Или вручную:
docker-compose up --build -d
```

## ✅ Ключевые изменения в docker-compose.yml

1. **BFL_API_KEY** добавлен во все сервисы
2. **database volume** добавлен в frontend для API projects
3. **Правильные volumes** для разработки и продакшена
4. **postgres:15-alpine** вместо postgres:15
5. **Удален Grafana** (оставлен только Prometheus)

## 🚀 Альтернативное решение (если конфликт сложный)

Если конфликт слишком сложный, можно:

```bash
# Отменить merge
git merge --abort

# Принудительно обновить файл
git checkout origin/main -- docker-compose.yml

# Добавить изменения
git add docker-compose.yml
git commit -m "Update docker-compose.yml with latest changes"
```

## 📝 Проверка после исправления

```bash
# Проверить статус
git status

# Проверить Docker
docker-compose ps

# Проверить API
curl -I http://localhost:3000
curl -X POST http://localhost:3000/api/projects -H "Content-Type: application/json" -d '{"name": "test", "userId": "test"}'
```

**🎉 После выполнения этих шагов конфликт будет разрешен!** 