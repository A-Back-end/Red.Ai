#!/bin/bash

# Red.AI Docker Production Startup Script
echo "🚀 Starting Red.AI in Docker Production Mode..."

# Проверяем, что Docker запущен
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Проверяем наличие .env файла
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found. Please create it with your production environment variables."
    exit 1
fi

# Останавливаем существующие контейнеры
echo "🛑 Stopping existing containers..."
docker-compose down

# Удаляем старые образы для чистого запуска (опционально)
if [ "$1" = "--clean" ]; then
    echo "🧹 Cleaning old images..."
    docker-compose down --rmi all
fi

# Запускаем проект
echo "🏗️  Building and starting containers..."
docker-compose up --build -d

# Ждем запуска сервисов
echo "⏳ Waiting for services to start..."
sleep 20

# Проверяем статус
echo "📊 Checking service status..."
docker-compose ps

# Проверяем health checks
echo "🏥 Checking health status..."
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ Red.AI is running in Production Mode!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "🗄️  PostgreSQL: localhost:5432"
echo "📦 Redis: localhost:6379"
echo "📊 Prometheus: http://localhost:9090"
echo ""
echo "📝 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop: docker-compose down"
echo "  Restart: docker-compose restart"
echo "  Clean restart: ./start-docker-prod.sh --clean"
echo "" 