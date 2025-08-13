#!/bin/bash

# === Red.AI Production Deployment Script ===
# Similar to the video example with Docker + Nginx + SSL

set -e

echo "🚀 Starting Red.AI Production Deployment..."

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

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found. Creating from example...${NC}"
    cp env.production.example .env.production
    echo -e "${YELLOW}⚠️  Please edit .env.production with your actual values before continuing.${NC}"
    exit 1
fi

# Load environment variables
set -a
source .env.production
set +a

echo -e "${GREEN}✅ Environment variables loaded${NC}"

# Build and start services
echo -e "${GREEN}🏗️  Building Docker images...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

echo -e "${GREEN}🚢 Starting services...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo -e "${GREEN}⏳ Waiting for services to start...${NC}"
sleep 10

# Check if services are running
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo -e "${GREEN}🌐 Your app is now running at:${NC}"
    echo -e "${GREEN}   Frontend: http://localhost${NC}"
    echo -e "${GREEN}   Backend API: http://localhost/api${NC}"
    echo ""
    echo -e "${YELLOW}📋 Useful commands:${NC}"
    echo -e "${YELLOW}   View logs: docker-compose -f docker-compose.prod.yml logs -f${NC}"
    echo -e "${YELLOW}   Stop services: docker-compose -f docker-compose.prod.yml down${NC}"
    echo -e "${YELLOW}   Restart services: docker-compose -f docker-compose.prod.yml restart${NC}"
else
    echo -e "${RED}❌ Deployment failed. Check logs:${NC}"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi 