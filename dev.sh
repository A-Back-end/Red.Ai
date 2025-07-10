#!/bin/bash

# === Red.AI Development Setup Script ===
# For local development with Docker

set -e

echo "🚀 Starting Red.AI Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Use development environment file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env not found. Creating from example...${NC}"
    cp env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env with your development values.${NC}"
fi

echo -e "${GREEN}✅ Using development environment${NC}"

# Stop any running services
echo -e "${GREEN}🛑 Stopping any running services...${NC}"
docker-compose -f docker-compose.simple.yml down 2>/dev/null || true

# Build and start development services
echo -e "${GREEN}🏗️  Building development images...${NC}"
docker-compose -f docker-compose.simple.yml up --build -d

# Wait for services to be healthy
echo -e "${GREEN}⏳ Waiting for services to start...${NC}"
sleep 10

# Check if services are running
if docker-compose -f docker-compose.simple.yml ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Development environment ready!${NC}"
    echo ""
    echo -e "${GREEN}🌐 Your development app is running at:${NC}"
    echo -e "${GREEN}   Frontend: http://localhost:3000${NC}"
    echo -e "${GREEN}   Backend: http://localhost:8000${NC}"
    echo -e "${GREEN}   Backend API Docs: http://localhost:8000/docs${NC}"
    echo ""
    echo -e "${YELLOW}📋 Useful commands:${NC}"
    echo -e "${YELLOW}   View logs: docker-compose -f docker-compose.simple.yml logs -f${NC}"
    echo -e "${YELLOW}   Stop services: docker-compose -f docker-compose.simple.yml down${NC}"
    echo -e "${YELLOW}   Restart services: docker-compose -f docker-compose.simple.yml restart${NC}"
else
    echo -e "${RED}❌ Development setup failed. Check logs:${NC}"
    docker-compose -f docker-compose.simple.yml logs
    exit 1
fi 