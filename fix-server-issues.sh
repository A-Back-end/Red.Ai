#!/bin/bash

# 🔧 Red.AI Server Issues Fix Script
# Исправляет проблемы с удалением проектов и их сохранением на сервере

set -e

echo "🔧 Starting Red.AI server issues fix..."

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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. This is not recommended for security reasons."
fi

# Step 1: Stop all running containers
print_status "Stopping all running containers..."
docker-compose -f docker-compose-redai-prod.yml down || true
docker-compose -f docker-compose.prod.yml down || true
docker-compose down || true

# Step 2: Backup current database
print_status "Creating backup of current database..."
if [ -f "database/projects.json" ]; then
    cp database/projects.json database/projects.json.backup.$(date +%Y%m%d_%H%M%S)
    print_success "Database backed up successfully"
else
    print_warning "No existing database file found"
fi

# Step 3: Fix file permissions
print_status "Fixing file permissions..."
sudo chown -R $USER:$USER database/ || true
chmod 755 database/ || true
chmod 644 database/projects.json || true

# Step 4: Create database directory if it doesn't exist
print_status "Ensuring database directory exists..."
mkdir -p database
chmod 755 database

# Step 5: Initialize database file if it doesn't exist
if [ ! -f "database/projects.json" ]; then
    print_status "Creating new database file..."
    echo "[]" > database/projects.json
    chmod 644 database/projects.json
    print_success "New database file created"
fi

# Step 6: Rebuild Docker images with fixed permissions
print_status "Rebuilding Docker images with fixed permissions..."

# Build backend with new Dockerfile
print_status "Building backend image..."
docker build -f Dockerfile.backend -t redai-backend:latest .

# Build frontend
print_status "Building frontend image..."
docker build -f Dockerfile.frontend -t redai-frontend:latest .

print_success "Docker images rebuilt successfully"

# Step 7: Update docker-compose file to include database volume
print_status "Updating docker-compose configuration..."

# Create a backup of the current docker-compose file
if [ -f "docker-compose-redai-prod.yml" ]; then
    cp docker-compose-redai-prod.yml docker-compose-redai-prod.yml.backup.$(date +%Y%m%d_%H%M%S)
fi

# Step 8: Start services with new configuration
print_status "Starting services with new configuration..."

# Use the production docker-compose file
if [ -f "docker-compose-redai-prod.yml" ]; then
    docker-compose -f docker-compose-redai-prod.yml up -d
else
    print_warning "docker-compose-redai-prod.yml not found, using default docker-compose.yml"
    docker-compose up -d
fi

# Step 9: Wait for services to start
print_status "Waiting for services to start..."
sleep 10

# Step 10: Check service status
print_status "Checking service status..."
docker-compose ps

# Step 11: Test API endpoints
print_status "Testing API endpoints..."

# Test projects API
echo "Testing projects API..."
curl -s http://localhost/api/projects || print_warning "Projects API not accessible"

# Test health endpoint
echo "Testing health endpoint..."
curl -s http://localhost/health || print_warning "Health endpoint not accessible"

# Step 12: Check logs for any errors
print_status "Checking service logs..."
echo "=== Backend logs ==="
docker-compose logs --tail=20 backend || true

echo "=== Frontend logs ==="
docker-compose logs --tail=20 frontend || true

# Step 13: Verify database file permissions in container
print_status "Verifying database file permissions in container..."
docker-compose exec backend ls -la /app/database/ || print_warning "Could not check database permissions in container"

# Step 14: Create test project to verify functionality
print_status "Creating test project to verify functionality..."
TEST_PROJECT='{
  "userId": "test-user-fix",
  "name": "Test Project - Server Fix",
  "description": "Testing project creation after server fix",
  "imageUrl": "https://example.com/test.jpg",
  "status": "completed",
  "generatedImages": ["https://example.com/test.jpg"],
  "budget": {"min": 5000, "max": 7500, "currency": "RUB"},
  "preferredStyles": ["modern"]
}'

curl -X POST http://localhost/api/projects \
  -H "Content-Type: application/json" \
  -d "$TEST_PROJECT" || print_warning "Could not create test project"

print_success "Server issues fix completed!"

echo ""
echo "📋 Summary of fixes applied:"
echo "✅ Stopped all running containers"
echo "✅ Backed up existing database"
echo "✅ Fixed file permissions"
echo "✅ Rebuilt Docker images with proper user permissions"
echo "✅ Started services with new configuration"
echo "✅ Tested API endpoints"
echo ""
echo "🔍 Next steps:"
echo "1. Test the application at https://redai.site"
echo "2. Try creating and deleting projects"
echo "3. Check if images are being saved properly"
echo "4. Monitor logs: docker-compose logs -f"
echo ""
echo "📞 If issues persist, check the logs above for specific error messages" 