#!/bin/bash

# Red.AI Server Deployment Script
# Optimized for production deployment with Docker

set -e

echo "🚀 Starting Red.AI Server Deployment..."

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

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Clean up Docker resources
cleanup_docker() {
    print_status "Cleaning up Docker resources..."
    
    # Stop and remove existing containers
    docker-compose -f docker/docker-compose-server.yml down --remove-orphans 2>/dev/null || true
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful with this in production)
    docker volume prune -f
    
    # Remove unused networks
    docker network prune -f
    
    print_success "Docker cleanup completed"
}

# Check disk space
check_disk_space() {
    print_status "Checking available disk space..."
    
    # Get available space in GB
    available_space=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    
    if [ "$available_space" -lt 10 ]; then
        print_warning "Low disk space detected: ${available_space}G available"
        print_status "Consider cleaning up disk space before deployment"
    else
        print_success "Sufficient disk space: ${available_space}G available"
    fi
}

# Build images with optimized settings
build_images() {
    print_status "Building Docker images with optimized settings..."
    
    # Set Docker build arguments for optimization
    export DOCKER_BUILDKIT=1
    export COMPOSE_DOCKER_CLI_BUILD=1
    
    # Build with no cache for fresh start (optional)
    if [ "$1" = "--no-cache" ]; then
        print_status "Building with --no-cache flag..."
        docker-compose -f docker/docker-compose-server.yml build --no-cache --parallel
    else
        docker-compose -f docker/docker-compose-server.yml build --parallel
    fi
    
    print_success "Docker images built successfully"
}

# Start services
start_services() {
    print_status "Starting Red.AI services..."
    
    # Start services in detached mode
    docker-compose -f docker/docker-compose-server.yml up -d
    
    print_success "Services started successfully"
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait for services to be ready
    sleep 10
    
    # Check if containers are running
    if docker-compose -f docker/docker-compose-server.yml ps | grep -q "Up"; then
        print_success "All services are running"
    else
        print_error "Some services failed to start"
        docker-compose -f docker/docker-compose-server.yml logs
        exit 1
    fi
}

# Show service status
show_status() {
    print_status "Service Status:"
    docker-compose -f docker/docker-compose-server.yml ps
    
    echo ""
    print_status "Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

# Main deployment function
deploy() {
    print_status "Starting deployment process..."
    
    check_docker
    check_disk_space
    cleanup_docker
    build_images "$1"
    start_services
    check_health
    show_status
    
    print_success "🎉 Red.AI deployment completed successfully!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:8000"
    print_status "AI Processor: http://localhost:8001"
}

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --no-cache    Build images without cache (fresh build)"
    echo "  --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Normal deployment"
    echo "  $0 --no-cache   # Fresh build deployment"
}

# Parse command line arguments
case "${1:-}" in
    --no-cache)
        deploy --no-cache
        ;;
    --help|-h)
        usage
        ;;
    "")
        deploy
        ;;
    *)
        print_error "Unknown option: $1"
        usage
        exit 1
        ;;
esac 