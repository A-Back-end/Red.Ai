#!/bin/bash

# Red.AI Production Startup Script
# Запускает production версию приложения

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.production.yml" ]; then
    print_error "docker-compose.production.yml not found. Please run this script from the project root."
    exit 1
fi

# Check and setup environment
print_status "Checking environment setup..."
if [ -f "scripts/check-and-setup-env.sh" ]; then
    source scripts/check-and-setup-env.sh
else
    print_warning "Environment check script not found. Proceeding with basic checks..."
    
    # Basic environment check
    if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
        print_error "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set"
        print_status "Please set this variable in your .env file"
        exit 1
    fi
    
    if [[ "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" == *"YOUR_CLERK_PUBLISHABLE_KEY_HERE"* ]] || \
       [[ "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" == *"placeholder"* ]]; then
        print_error "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY contains placeholder value"
        print_status "Please set a real Clerk API key in your .env file"
        exit 1
    fi
fi

# Stop any running containers
print_status "Stopping any running containers..."
docker-compose -f docker-compose.production.yml down --remove-orphans

# Clean up any dangling images
print_status "Cleaning up Docker images..."
docker system prune -f

# Build and start services
print_status "Building and starting production services..."
docker-compose -f docker-compose.production.yml up --build -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 10

# Check service health
print_status "Checking service health..."

# Check frontend
if docker-compose -f docker-compose.production.yml exec -T frontend curl -f http://localhost:3000/ > /dev/null 2>&1; then
    print_success "Frontend is healthy"
else
    print_warning "Frontend health check failed, but continuing..."
fi

# Check backend
if docker-compose -f docker-compose.production.yml exec -T backend curl -f http://localhost:8000/health > /dev/null 2>&1; then
    print_success "Backend is healthy"
else
    print_warning "Backend health check failed, but continuing..."
fi

# Check database
if docker-compose -f docker-compose.production.yml exec -T postgres pg_isready -U redai_user -d redai_db > /dev/null 2>&1; then
    print_success "Database is healthy"
else
    print_warning "Database health check failed, but continuing..."
fi

# Show running services
print_status "Showing running services..."
docker-compose -f docker-compose.production.yml ps

# Show logs
print_status "Showing recent logs..."
docker-compose -f docker-compose.production.yml logs --tail=20

print_success "Production services started successfully!"
print_status "Frontend: http://localhost:3000"
print_status "Backend: http://localhost:8000"
print_status "Database: localhost:5432"
print_status "Redis: localhost:6379"

print_status "To view logs: docker-compose -f docker-compose.production.yml logs -f"
print_status "To stop: docker-compose -f docker-compose.production.yml down"
