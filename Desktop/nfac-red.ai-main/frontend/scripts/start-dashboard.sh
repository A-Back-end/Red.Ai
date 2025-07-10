#!/bin/bash

# RED AI Dashboard Server Startup Script
# Optimized for dashboard functionality with AI services

echo "📊 Starting RED AI Dashboard Server..."
echo "=" * 50

# Check if we're in the correct directory
if [ ! -f "backend/main.py" ]; then
    echo "❌ Error: backend/main.py not found. Please run from project root."
    exit 1
fi

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated (venv)"
elif [ -d ".venv" ]; then
    source .venv/bin/activate
    echo "✅ Virtual environment activated (.venv)"
else
    echo "❌ Virtual environment not found. Please run ./scripts/start-dev.sh first."
    exit 1
fi

# Check environment configuration
if [ ! -f "backend/dotenv/.env" ]; then
    echo "⚠️  Environment file not found. Creating from template..."
    cp backend/dotenv/env.example backend/dotenv/.env
    echo "✅ Environment file created. Please edit backend/dotenv/.env with your API keys."
    echo "🔧 Configure your Azure OpenAI credentials before continuing."
    read -p "Press Enter when ready..."
fi

# Set environment variables for dashboard
export PYTHONPATH="${PYTHONPATH}:$(pwd)/backend"
export DEBUG=false
export LOG_LEVEL=INFO
export ENABLE_DASHBOARD_ANALYTICS=true
export ENABLE_CLIENT_MANAGEMENT=true
export ENABLE_DESIGN_GENERATION=true
export ENABLE_FLOOR_PLAN_ANALYSIS=true
export ENABLE_CHAT_ASSISTANT=true

# Dashboard-specific settings
export DASHBOARD_MODE=true
export BACKGROUND_TASKS_ENABLED=true
export MAX_CONCURRENT_TASKS=10

echo "🔧 Dashboard Configuration:"
echo "   📊 Analytics: ✅ Enabled"
echo "   👥 Client Management: ✅ Enabled"
echo "   🎨 Design Generation: ✅ Enabled"
echo "   🏠 Floor Plan Analysis: ✅ Enabled"
echo "   💬 AI Chat Assistant: ✅ Enabled"
echo ""

# Pre-flight checks
echo "🔍 Running pre-flight checks..."

# Check AI services configuration
cd backend
python -c "
from dotenv.config import settings
import sys

print('🤖 AI Services Check:')
if settings.is_azure_openai_configured():
    print('   ✅ Azure OpenAI: Configured')
else:
    print('   ❌ Azure OpenAI: Not configured')
    
if settings.is_ai_configured():
    print('   ✅ AI Services: Ready')
    sys.exit(0)
else:
    print('   ❌ AI Services: Not configured')
    print('   🔧 Please configure your API keys in backend/dotenv/.env')
    sys.exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Pre-flight check failed. Please configure your environment."
    exit 1
fi

echo "✅ Pre-flight checks passed!"
echo ""

# Start the dashboard server
echo "🚀 Starting RED AI Dashboard Server..."
echo ""
echo "📊 Dashboard API: http://localhost:8000"
echo "📈 Statistics: http://localhost:8000/api/dashboard/stats"
echo "📋 Tasks: http://localhost:8000/api/dashboard/tasks"
echo "👥 Clients: http://localhost:8000/api/dashboard/clients"
echo "🎨 Designs: http://localhost:8000/api/dashboard/designs"
echo "🤖 AI Services: http://localhost:8000/api/ai/*"
echo ""
echo "📖 API Documentation: http://localhost:8000/docs"
echo "🔧 ReDoc Documentation: http://localhost:8000/redoc"
echo "❤️  Health Check: http://localhost:8000/health"
echo "✨ Features: http://localhost:8000/api/features"
echo ""
echo "Press Ctrl+C to stop the dashboard server"
echo ""

# Start server with dashboard optimizations
python -m uvicorn main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 1 \
    --log-level info \
    --access-log \
    --use-colors \
    --proxy-headers \
    --forwarded-allow-ips="*"

echo ""
echo "📊 RED AI Dashboard Server stopped."
echo "Thank you for using RED AI! 🏠✨" 