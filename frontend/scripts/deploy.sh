#!/bin/bash

# Red.AI Production Deployment Script
# Скрипт для развертывания в production

set -e

echo "🚀 Starting Red.AI Production Deployment..."

# Проверка окружения
if [ "$NODE_ENV" != "production" ]; then
    echo "⚠️  Warning: NODE_ENV is not set to 'production'"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Проверка наличия необходимых переменных окружения
REQUIRED_VARS=(
    "SECRET_KEY"
    "DATABASE_URL"
    "OPENAI_API_KEY"
    "DOMAIN"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

# Создание резервной копии
echo "💾 Creating backup..."
./scripts/backup.sh

# Остановка существующих контейнеров
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Обновление кода
echo "📥 Pulling latest code..."
git pull origin main

# Сборка новых образов
echo "🏗️  Building production images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Запуск миграций базы данных
echo "🔄 Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm backend python -m alembic upgrade head

# Запуск сервисов
echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Проверка здоровья сервисов
echo "🔍 Checking service health..."
sleep 30

# Проверка backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$BACKEND_STATUS" != "200" ]; then
    echo "❌ Backend health check failed (HTTP $BACKEND_STATUS)"
    exit 1
fi

# Проверка frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [ "$FRONTEND_STATUS" != "200" ]; then
    echo "❌ Frontend health check failed (HTTP $FRONTEND_STATUS)"
    exit 1
fi

# Проверка базы данных
DB_STATUS=$(docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -q)
if [ $? -ne 0 ]; then
    echo "❌ Database health check failed"
    exit 1
fi

# Очистка старых образов
echo "🧹 Cleaning up old images..."
docker image prune -f

# Уведомление о завершении
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Services:"
echo "   Frontend: https://$DOMAIN"
echo "   API:      https://$DOMAIN/api"
echo "   Status:   https://$DOMAIN/health"
echo ""
echo "📊 Monitoring:"
echo "   Prometheus: https://$DOMAIN:9090"
echo "   Grafana:    https://$DOMAIN:3001"
echo ""

# Отправка уведомления в Slack/Discord (если настроено)
if [ -n "$DEPLOY_WEBHOOK_URL" ]; then
    echo "📢 Sending deployment notification..."
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Red.AI deployed successfully to production\nCommit: $(git rev-parse --short HEAD)\nTime: $(date)\"}" \
        "$DEPLOY_WEBHOOK_URL"
fi

# Проверка SSL сертификата
if [ "$SSL_ENABLED" = "true" ]; then
    echo "🔒 Checking SSL certificate..."
    openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null 2>/dev/null | openssl x509 -noout -dates
fi

echo "🎉 Red.AI is now running in production!"
echo "📝 Don't forget to:"
echo "   - Monitor logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   - Check metrics in Grafana"
echo "   - Test all major features"
echo "   - Update DNS records if needed" 