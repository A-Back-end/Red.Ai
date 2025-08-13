#!/bin/bash

# Red.AI Docker Development Startup Script
echo "🚀 Starting Red.AI in Docker Development Mode..."

# Проверяем, что Docker запущен
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Останавливаем существующие контейнеры
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down

# Удаляем старые образы для чистого запуска (опционально)
if [ "$1" = "--clean" ]; then
    echo "🧹 Cleaning old images..."
    docker-compose -f docker-compose.dev.yml down --rmi all
fi

# Запускаем проект
echo "🏗️  Building and starting containers..."
docker-compose -f docker-compose.dev.yml up --build -d

# Ждем запуска сервисов
echo "⏳ Waiting for services to start..."
sleep 15

# Проверяем статус
echo "📊 Checking service status..."
docker-compose -f docker-compose.dev.yml ps

# Проверяем health checks
echo "🏥 Checking health status..."
docker-compose -f docker-compose.dev.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ Red.AI is running in Docker!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "🗄️  PostgreSQL: localhost:5432"
echo "📦 Redis: localhost:6379"
echo ""
echo "📝 Useful commands:"
echo "  View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "  Stop: docker-compose -f docker-compose.dev.yml down"
echo "  Restart: docker-compose -f docker-compose.dev.yml restart"
echo "  Clean restart: ./start-docker-dev.sh --clean"
echo "" 