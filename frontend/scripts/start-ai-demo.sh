#!/bin/bash

echo "🤖 Запуск RED AI с ИИ интеграцией..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не найден. Установите Python 3.8+"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "backend/main.py" ]; then
    echo "❌ Запустите скрипт из корневой папки проекта"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "backend/venv" ]; then
    echo "📦 Создание виртуального окружения..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment
echo "🔧 Активация виртуального окружения..."
source backend/venv/bin/activate

# Install dependencies
echo "📚 Установка зависимостей..."
cd backend
pip install -r requirements.txt
cd ..

# Create uploads directory
mkdir -p backend/uploads

# Check for AI API keys
echo "🔍 Проверка конфигурации ИИ..."

if [ -f ".env" ]; then
    echo "✅ Файл .env найден"
else
    echo "⚠️  Создайте файл .env с вашими API ключами для ИИ"
    echo "   Пример: OPENAI_API_KEY=sk-ваш-ключ"
fi

# Start backend
echo "🚀 Запуск backend сервера..."
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Ожидание запуска backend..."
sleep 3

# Start simple HTTP server for frontend
echo "🌐 Запуск frontend сервера..."
python3 -m http.server 8080 &
FRONTEND_PID=$!

echo ""
echo "🎉 RED AI запущен!"
echo ""
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Backend API: http://localhost:8000"
echo "📖 API документация: http://localhost:8000/api/docs"
echo ""
echo "🤖 ИИ функции:"
echo "   • Анализ планировок - загрузите изображение"
echo "   • ИИ чат - задавайте вопросы"
echo "   • Дизайн предложения - опишите комнату"
echo ""
echo "⚠️  Для полной функциональности ИИ добавьте API ключи в .env файл"
echo ""
echo "💡 Нажмите Ctrl+C для остановки серверов"

# Wait for user interrupt
trap "echo ''; echo '🛑 Остановка серверов...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait 