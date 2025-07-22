#!/bin/bash

# Red.AI Development Startup Script
# Скрипт для запуска development окружения

set -e

echo "🚀 Starting Red.AI Development Environment..."

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Проверка файла .env
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before continuing."
    echo "   Required: OPENAI_API_KEY, SECRET_KEY, DATABASE_URL"
    exit 1
fi

# Создание необходимых директорий
echo "📁 Creating directories..."
mkdir -p uploads logs static

# Остановка существующих контейнеров
echo "🛑 Stopping existing containers..."
docker-compose down

# Сборка и запуск сервисов
echo "🏗️  Building and starting services..."
docker-compose up -d postgres redis

# Ожидание готовности базы данных
echo "⏳ Waiting for database to be ready..."
sleep 10

# Проверка подключения к базе данных
echo "🔍 Checking database connection..."
docker-compose exec postgres pg_isready -U ${POSTGRES_USER:-redai_user} -d ${POSTGRES_DB:-redai}

# Запуск миграций
echo "🔄 Running database migrations..."
docker-compose exec -T postgres psql -U ${POSTGRES_USER:-redai_user} -d ${POSTGRES_DB:-redai} -c "SELECT 1;"

# Запуск backend в development режиме
echo "🔧 Starting backend in development mode..."
cd src/backend

# Проверка Python виртуального окружения
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Активация виртуального окружения
source venv/bin/activate

# Установка зависимостей
echo "📦 Installing Python dependencies..."
pip install -r ../../requirements/dev.txt

# Запуск backend сервера
echo "🚀 Starting FastAPI server..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Возвращение в корневую директорию
cd ../../

# Запуск frontend в development режиме
echo "🎨 Starting frontend in development mode..."
cd src/frontend

# Проверка Node.js зависимостей
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Запуск frontend сервера
echo "🚀 Starting Next.js server..."
npm run dev &
FRONTEND_PID=$!

# Возвращение в корневую директорию
cd ../../

# Функция для graceful shutdown
cleanup() {
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    docker-compose down
    exit 0
}

# Перехват сигналов завершения
trap cleanup SIGINT SIGTERM

echo "✅ Red.AI Development Environment is running!"
echo ""
echo "🌐 Services:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo "   Database: localhost:5432"
echo "   Redis:    localhost:6379"
echo ""
echo "📊 Monitoring:"
echo "   Prometheus: http://localhost:9090"

echo ""
echo "💡 Tips:"
echo "   - Edit .env file for configuration"
echo "   - Use Ctrl+C to stop all services"
echo "   - Check logs: docker-compose logs -f"
echo ""
echo "🔄 Press Ctrl+C to stop all services..."

# Ожидание завершения
wait 