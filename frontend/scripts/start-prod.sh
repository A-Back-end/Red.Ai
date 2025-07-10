#!/bin/bash

echo "🏭 Starting RED AI Production Environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ Backend .env file is missing. Please create it from .env.example${NC}"
    exit 1
fi

echo -e "${BLUE}🏗️  Building Docker images...${NC}"
docker-compose -f docker-compose.prod.yml build

echo -e "${BLUE}🚀 Starting production services...${NC}"
docker-compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}✅ Production environment started!${NC}"
echo ""
echo -e "${BLUE}Services:${NC}"
echo "  🌐 Frontend: http://localhost:80"
echo "  🔌 Backend API: http://localhost:80/api"
echo "  📚 API Docs: http://localhost:80/docs"
echo ""
echo -e "${YELLOW}To stop services:${NC}"
echo "  docker-compose -f docker-compose.prod.yml down"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo "  docker-compose -f docker-compose.prod.yml logs -f" 