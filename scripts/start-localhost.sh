#!/bin/bash

echo "🚀 Starting RED AI Platform on localhost..."

# Kill any existing processes on port 3000
echo "📋 Checking for existing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No processes found on port 3000"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
echo "🔥 Starting development server..."
npm run dev &

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 10

# Check if server is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Server is running successfully!"
    echo "🌐 Open your browser and go to: http://localhost:3000"
    echo "📱 Static page: http://localhost:3000/index.html"
    echo "🎛️  Dashboard: http://localhost:3000/dashboard"
    echo ""
    echo "Press Ctrl+C to stop the server"
    
    # Keep the script running
    wait
else
    echo "❌ Failed to start server"
    exit 1
fi 