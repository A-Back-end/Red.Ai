#!/bin/bash

# Quick Docker Disk Space Fix
# Быстрое исправление проблем с местом на диске для Docker

echo "🚨 QUICK DOCKER DISK SPACE FIX"
echo "==============================================="

# Stop all Docker containers
echo "1. Stopping Docker containers..."
docker stop $(docker ps -aq) 2>/dev/null || echo "No containers running"

# Clean Docker system aggressively  
echo "2. Cleaning Docker system..."
docker system prune -af --volumes 2>/dev/null || echo "Docker cleanup failed"

# Remove large cache directories
echo "3. Removing cache directories..."
rm -rf .next node_modules/.cache __pycache__ *.pyc 2>/dev/null || true
find . -name "*.log" -size +1M -delete 2>/dev/null || true

# Remove Python virtual environments (they take a lot of space)
echo "4. Removing virtual environments..."
rm -rf backend/.venv backend/venv .venv venv 2>/dev/null || true

# Clean temp directories
echo "5. Cleaning temp files..."
rm -rf temp/* tmp/* logs/* 2>/dev/null || true

# Check disk space
echo "6. Checking disk space..."
df -h /

echo ""
echo "✅ Quick cleanup completed!"
echo "💡 Now try: docker-compose up -d --build"
echo ""
echo "If still failing, run the full cleanup:"
echo "   ./scripts/server-disk-cleanup.sh" 