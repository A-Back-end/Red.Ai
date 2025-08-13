#!/bin/bash

# DALL·E Image Generation Service Startup Script
echo "🎨 Starting DALL·E Image Generation Service..."

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found. Please run setup first:"
    echo "   python -m venv .venv"
    echo "   source .venv/bin/activate"
    echo "   pip install -r backend/requirements.txt"
    exit 1
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source .venv/bin/activate

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  Warning: OPENAI_API_KEY environment variable not set"
    echo "   Please set your OpenAI API key:"
    echo "   export OPENAI_API_KEY=your-api-key-here"
    echo ""
    echo "   Or create a .env file with:"
    echo "   OPENAI_API_KEY=your-api-key-here"
    echo ""
fi

# Set default values
export PORT=${PORT:-5000}
export DEBUG=${DEBUG:-false}
export FLASK_APP=backend/dalle_service.py

# Install dependencies if needed
echo "📚 Checking dependencies..."
pip install -q flask flask-cors openai pillow requests

echo ""
echo "🚀 Starting Flask service on port $PORT..."
echo "📍 Health check: http://localhost:$PORT/health"
echo "📍 Generate endpoint: http://localhost:$PORT/generate"
echo "📍 History endpoint: http://localhost:$PORT/history"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

# Start the Flask service
cd backend
python dalle_service.py 