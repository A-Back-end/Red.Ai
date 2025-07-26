#!/bin/bash

# Docker Maintenance Script for Red.AI
# Рекомендуется запускать еженедельно

set -e

echo "🧹 Docker Maintenance Script"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check Docker status
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi

if ! docker info &> /dev/null; then
    print_error "Docker is not running"
    exit 1
fi

# Show current disk usage
print_status "Current Docker disk usage:"
docker system df

# Show disk space
print_status "Current disk space:"
df -h /

# Remove stopped containers older than 7 days
print_status "Removing stopped containers older than 7 days..."
docker container prune -f --filter "until=168h"

# Remove dangling images
print_status "Removing dangling images..."
docker image prune -f

# Remove unused networks
print_status "Removing unused networks..."
docker network prune -f

# Remove unused volumes (be careful with this!)
print_status "Removing unused volumes..."
docker volume prune -f

# Clean up build cache
print_status "Cleaning up build cache..."
docker builder prune -f

# Remove images older than 30 days (optional)
read -p "Do you want to remove images older than 30 days? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Removing images older than 30 days..."
    docker image prune -af --filter "until=720h"
fi

# Show final disk usage
print_status "Final Docker disk usage:"
docker system df

# Show final disk space
print_status "Final disk space:"
df -h /

print_success "Docker maintenance completed!"

# Optional: Show top space consumers
print_status "Top 10 largest images:"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | head -11

print_status "Top 10 largest containers:"
docker ps -s --format "table {{.Names}}\t{{.Size}}" | head -11 