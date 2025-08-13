#!/bin/bash

# Red.AI Docker Stop Script
echo "🛑 Stopping Red.AI Docker containers..."

# Останавливаем dev контейнеры
echo "📦 Stopping development containers..."
docker-compose -f docker-compose.dev.yml down

# Останавливаем prod контейнеры
echo "🏭 Stopping production containers..."
docker-compose down

# Останавливаем все связанные контейнеры
echo "🧹 Cleaning up..."
docker system prune -f

echo ""
echo "✅ All Red.AI containers stopped!"
echo ""
echo "📝 To start again:"
echo "  Development: ./start-docker-dev.sh"
echo "  Production: ./start-docker-prod.sh"
echo "" 