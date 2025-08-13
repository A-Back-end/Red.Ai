#!/bin/bash

# Red.AI Docker Deployment Script
# Usage: ./start-docker.sh [environment]
# Environment: simple (default), prod, dev

ENVIRONMENT=${1:-simple}
ENV_FILE=".env"

echo "🚀 Starting Red.AI Platform with Docker Compose"
echo "Environment: $ENVIRONMENT"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  Warning: .env file not found. Creating from example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "📝 Please edit .env file with your actual API keys and configuration"
        echo "🔑 Required variables:"
        echo "   - AZURE_OPENAI_API_KEY"
        echo "   - AZURE_OPENAI_ENDPOINT" 
        echo "   - NEXT_PUBLIC_FIREBASE_API_KEY"
        echo "   - SECRET_KEY"
        read -p "Press Enter after configuring .env file..." -r
    else
        echo "❌ Error: env.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Choose docker-compose file based on environment
case $ENVIRONMENT in
    "simple")
        COMPOSE_FILE="docker-compose.simple.yml"
        ;;
    "prod")
        COMPOSE_FILE="docker-compose.prod.yml"
        ;;
    "dev")
        COMPOSE_FILE="docker-compose.yml"
        ;;
    *)
        echo "❌ Unknown environment: $ENVIRONMENT"
        echo "Available environments: simple, prod, dev"
        exit 1
        ;;
esac

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Error: $COMPOSE_FILE not found"
    exit 1
fi

echo "📦 Using compose file: $COMPOSE_FILE"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f "$COMPOSE_FILE" down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f "$COMPOSE_FILE" up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🏥 Checking service health..."

# Check frontend
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend is not responding"
fi

# Check backend
if curl -f http://localhost:8000 >/dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:8000"
else
    echo "❌ Backend is not responding"
fi

# Show running containers
echo "📊 Running containers:"
docker-compose -f "$COMPOSE_FILE" ps

echo ""
echo "🎉 Red.AI Platform is ready!"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Nginx: http://localhost:80"
echo ""
echo "📋 Management commands:"
echo "   View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "   Stop: docker-compose -f $COMPOSE_FILE down"
echo "   Restart: docker-compose -f $COMPOSE_FILE restart"
echo ""
echo "🔧 Troubleshooting:"
echo "   If services fail to start, check logs with:"
echo "   docker-compose -f $COMPOSE_FILE logs [service_name]" 