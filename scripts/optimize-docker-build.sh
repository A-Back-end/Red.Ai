#!/bin/bash

# Docker Build Optimization Script
# This script helps prevent "no space left on device" errors

echo "🐳 Docker Build Optimization Script"
echo "=================================="

# Function to clean Docker system
clean_docker() {
    echo "🧹 Cleaning Docker system..."
    docker system prune -a -f --volumes
    docker builder prune -a -f
    echo "✅ Docker cleanup completed"
}

# Function to check disk space
check_space() {
    echo "💾 Checking disk space..."
    df -h .
    echo ""
}

# Function to show Docker usage
show_docker_usage() {
    echo "📊 Docker system usage:"
    docker system df
    echo ""
}

# Function to build with optimizations
build_optimized() {
    echo "🚀 Building with optimizations..."
    
    # Set build arguments for optimization
    export DOCKER_BUILDKIT=1
    export COMPOSE_DOCKER_CLI_BUILD=1
    
    # Build with no-cache and parallel builds
    docker-compose build --no-cache --parallel --progress=plain
    
    echo "✅ Build completed"
}

# Function to monitor build process
monitor_build() {
    echo "👀 Monitoring build process..."
    
    # Watch disk space during build
    while true; do
        clear
        echo "=== Build Monitor ==="
        df -h .
        echo ""
        echo "Docker usage:"
        docker system df
        echo ""
        echo "Press Ctrl+C to stop monitoring"
        sleep 5
    done
}

# Main menu
case "${1:-}" in
    "clean")
        clean_docker
        ;;
    "check")
        check_space
        show_docker_usage
        ;;
    "build")
        clean_docker
        build_optimized
        ;;
    "monitor")
        monitor_build
        ;;
    *)
        echo "Usage: $0 {clean|check|build|monitor}"
        echo ""
        echo "Commands:"
        echo "  clean   - Clean Docker system and free space"
        echo "  check   - Check disk space and Docker usage"
        echo "  build   - Clean and build with optimizations"
        echo "  monitor - Monitor disk space during build"
        echo ""
        echo "Example: $0 build"
        ;;
esac
