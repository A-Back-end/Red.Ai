#!/bin/bash

# Docker Cleanup Script for Red.AI
# Frees up disk space by removing unused Docker resources

set -e

echo "🧹 Starting Docker Cleanup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check disk space before cleanup
check_disk_space() {
    print_status "Checking disk space before cleanup..."
    
    available_before=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    print_status "Available space before cleanup: ${available_before}G"
}

# Stop all running containers
stop_containers() {
    print_status "Stopping all running containers..."
    
    # Stop Red.AI containers specifically
    docker-compose -f docker/docker-compose-server.yml down --remove-orphans 2>/dev/null || true
    docker-compose -f docker/docker-compose-prod.yml down --remove-orphans 2>/dev/null || true
    
    # Stop any other running containers
    running_containers=$(docker ps -q)
    if [ -n "$running_containers" ]; then
        print_warning "Stopping other running containers..."
        docker stop $running_containers
    fi
    
    print_success "All containers stopped"
}

# Remove unused containers
remove_containers() {
    print_status "Removing unused containers..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove all containers (be careful!)
    if [ "$1" = "--force" ]; then
        print_warning "Force removing all containers..."
        docker rm -f $(docker ps -aq) 2>/dev/null || true
    fi
    
    print_success "Unused containers removed"
}

# Remove unused images
remove_images() {
    print_status "Removing unused images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove all unused images
    docker image prune -a -f
    
    # Remove specific Red.AI images if they exist
    docker rmi $(docker images | grep 'redai' | awk '{print $3}') 2>/dev/null || true
    
    print_success "Unused images removed"
}

# Remove unused volumes
remove_volumes() {
    print_status "Removing unused volumes..."
    
    # Remove unused volumes
    docker volume prune -f
    
    print_success "Unused volumes removed"
}

# Remove unused networks
remove_networks() {
    print_status "Removing unused networks..."
    
    # Remove unused networks
    docker network prune -f
    
    print_success "Unused networks removed"
}

# Clean build cache
clean_build_cache() {
    print_status "Cleaning Docker build cache..."
    
    # Remove build cache
    docker builder prune -f
    
    # Remove all build cache (more aggressive)
    if [ "$1" = "--force" ]; then
        docker builder prune -a -f
    fi
    
    print_success "Build cache cleaned"
}

# Clean system
clean_system() {
    print_status "Performing full system cleanup..."
    
    # Remove everything unused
    docker system prune -a -f
    
    print_success "System cleanup completed"
}

# Check disk space after cleanup
check_disk_space_after() {
    print_status "Checking disk space after cleanup..."
    
    available_after=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    print_status "Available space after cleanup: ${available_after}G"
    
    # Calculate freed space
    if [ -n "$available_before" ] && [ -n "$available_after" ]; then
        freed_space=$((available_after - available_before))
        if [ $freed_space -gt 0 ]; then
            print_success "Freed up ${freed_space}G of disk space!"
        else
            print_warning "No additional space was freed"
        fi
    fi
}

# Show Docker disk usage
show_docker_usage() {
    print_status "Docker disk usage:"
    docker system df
}

# Main cleanup function
cleanup() {
    print_status "Starting comprehensive Docker cleanup..."
    
    check_disk_space
    stop_containers
    remove_containers "$1"
    remove_images
    remove_volumes
    remove_networks
    clean_build_cache "$1"
    clean_system
    check_disk_space_after
    show_docker_usage
    
    print_success "🎉 Docker cleanup completed successfully!"
}

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --force       Force remove all containers and build cache"
    echo "  --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Normal cleanup"
    echo "  $0 --force      # Aggressive cleanup (removes everything)"
}

# Parse command line arguments
case "${1:-}" in
    --force)
        print_warning "Running aggressive cleanup - this will remove ALL containers and build cache!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cleanup --force
        else
            print_status "Cleanup cancelled"
            exit 0
        fi
        ;;
    --help|-h)
        usage
        ;;
    "")
        cleanup
        ;;
    *)
        print_error "Unknown option: $1"
        usage
        exit 1
        ;;
esac 