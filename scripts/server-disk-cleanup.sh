#!/bin/bash

# Server Disk Cleanup Script
# Очистка места на диске для успешного запуска Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

echo_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo_step() {
    echo -e "\n${YELLOW}📋 $1${NC}"
}

echo_step "🧹 Server Disk Cleanup - Freeing up space for Docker"

# Check current disk usage
echo_step "1. Checking current disk usage..."
df -h / | grep -E "(Filesystem|/dev/)"
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
echo_info "Current disk usage: ${DISK_USAGE}%"

if [ "$DISK_USAGE" -gt 90 ]; then
    echo_error "Disk usage is critical (>90%)"
elif [ "$DISK_USAGE" -gt 80 ]; then
    echo_warning "Disk usage is high (>80%)"
else
    echo_success "Disk usage is acceptable (<80%)"
fi

# Clean Docker system
echo_step "2. Cleaning Docker system..."

echo_info "Stopping all containers..."
docker stop $(docker ps -aq) 2>/dev/null || echo "No containers to stop"

echo_info "Removing unused containers..."
docker container prune -f || echo "No containers to remove"

echo_info "Removing unused images..."
docker image prune -af || echo "No images to remove"

echo_info "Removing unused volumes..."
docker volume prune -f || echo "No volumes to remove"

echo_info "Removing unused networks..."
docker network prune -f || echo "No networks to remove"

echo_info "Cleaning build cache..."
docker builder prune -af || echo "No build cache to clean"

echo_success "Docker cleanup completed"

# Find and clean large files in project
echo_step "3. Cleaning project files..."

echo_info "Removing Python cache files..."
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true

echo_info "Removing Node.js cache files..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .next 2>/dev/null || true

echo_info "Removing Python virtual environments..."
rm -rf backend/.venv 2>/dev/null || true
rm -rf backend/venv 2>/dev/null || true
rm -rf .venv 2>/dev/null || true
rm -rf venv 2>/dev/null || true

echo_info "Removing log files..."
find . -name "*.log" -size +10M -delete 2>/dev/null || true
rm -rf logs/* 2>/dev/null || true

echo_info "Removing temporary files..."
rm -rf temp/* 2>/dev/null || true
rm -rf tmp/* 2>/dev/null || true

echo_success "Project cleanup completed"

# Clean system logs and temp files
echo_step "4. Cleaning system files..."

echo_info "Cleaning apt cache..."
sudo apt clean 2>/dev/null || echo "apt clean not available"

echo_info "Cleaning journal logs..."
sudo journalctl --vacuum-time=7d 2>/dev/null || echo "journalctl not available"

echo_info "Cleaning tmp directories..."
sudo rm -rf /tmp/* 2>/dev/null || true
sudo rm -rf /var/tmp/* 2>/dev/null || true

echo_success "System cleanup completed"

# Find largest files
echo_step "5. Finding largest files..."
echo_info "Top 10 largest files in project:"
find . -type f -not -path './.git/*' -not -path './node_modules/*' -exec ls -lh {} + 2>/dev/null | \
sort -k5 -hr | head -10 || echo "Could not list files"

# Check disk usage after cleanup
echo_step "6. Checking disk usage after cleanup..."
df -h / | grep -E "(Filesystem|/dev/)"
NEW_DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
echo_info "New disk usage: ${NEW_DISK_USAGE}%"

SAVED_SPACE=$((DISK_USAGE - NEW_DISK_USAGE))
if [ "$SAVED_SPACE" -gt 0 ]; then
    echo_success "Freed up ${SAVED_SPACE}% disk space"
else
    echo_info "Disk usage remained the same"
fi

# Check if we have enough space now
if [ "$NEW_DISK_USAGE" -lt 80 ]; then
    echo_success "✅ Disk space is now sufficient for Docker builds"
else
    echo_warning "⚠️ Disk usage is still high. May need manual cleanup of large files"
fi

echo_step "🎉 Cleanup Summary"
echo_info "Original usage: ${DISK_USAGE}%"
echo_info "Current usage: ${NEW_DISK_USAGE}%"
echo_info "Space freed: ${SAVED_SPACE}%"

echo ""
echo_success "🚀 Ready to try docker-compose up again!"
echo_info "Run: docker-compose up -d --build" 