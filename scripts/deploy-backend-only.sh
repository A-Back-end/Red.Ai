#!/bin/bash

# Red.AI Backend-Only Deployment Script
# Deploys backend and AI processor services without frontend

set -e

echo "🚀 Starting Red.AI Backend-Only Deployment..."

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
    docker-compose -f docker/docker-compose-server-simple.yml down --remove-orphans 2>/dev/null || true
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    print_success "Docker cleanup completed"
}

# Check disk space
check_disk_space() {
    print_status "Checking available disk space..."
    
    # Get available space in GB (macOS compatible)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        available_space=$(df -g . | awk 'NR==2 {print $4}')
    else
        available_space=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    fi
    
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
        docker-compose -f docker/docker-compose-server-simple.yml build --no-cache --parallel
    else
        docker-compose -f docker/docker-compose-server-simple.yml build --parallel
    fi
    
    print_success "Docker images built successfully"
}

# Start services
start_services() {
    print_status "Starting Red.AI backend services..."
    
    # Start services in detached mode
    docker-compose -f docker/docker-compose-server-simple.yml up -d
    
    print_success "Services started successfully"
}

# Check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait for services to be ready
    sleep 15
    
    # Check if containers are running
    if docker-compose -f docker/docker-compose-server-simple.yml ps | grep -q "Up"; then
        print_success "All services are running"
    else
        print_error "Some services failed to start"
        docker-compose -f docker/docker-compose-server-simple.yml logs
        exit 1
    fi
}

# Show service status
show_status() {
    print_status "Service Status:"
    docker-compose -f docker/docker-compose-server-simple.yml ps
    
    echo ""
    print_status "Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

# Test API endpoints
test_endpoints() {
    print_status "Testing API endpoints..."
    
    # Wait a bit more for services to fully start
    sleep 10
    
    # Test backend health
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_warning "Backend health check failed (may still be starting)"
    fi
    
    # Test AI processor health
    if curl -f http://localhost:8001/health > /dev/null 2>&1; then
        print_success "AI Processor health check passed"
    else
        print_warning "AI Processor health check failed (may still be starting)"
    fi
}

# Main deployment function
deploy() {
    print_status "Starting backend-only deployment process..."
    
    check_docker
    check_disk_space
    cleanup_docker
    build_images "$1"
    start_services
    check_health
    show_status
    test_endpoints
    
    print_success "🎉 Red.AI backend deployment completed successfully!"
    print_status "Backend API: http://localhost:8000"
    print_status "AI Processor: http://localhost:8001"
    print_status ""
    print_status "Next steps:"
    print_status "1. Set up your Azure OpenAI API keys in .env file"
    print_status "2. Test the API endpoints"
    print_status "3. Deploy frontend separately when ready"
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