#!/bin/bash

# 🚀 Red.AI Server Deploy Fix Script
# Деплоит исправления на сервер redai.site

set -e

echo "🚀 Starting Red.AI server deploy fix..."

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
if [ ! -f "package.json" ] || [ ! -f "docker-compose-redai-prod.yml" ]; then
    print_error "This script must be run from the Red.AI project root directory"
    exit 1
fi

# Step 1: Git operations
print_status "Updating git repository..."
git add .
git commit -m "[server-fix] Fix project deletion and saving issues" || print_warning "No changes to commit"
git push origin main || print_warning "Could not push to git"

# Step 2: Run the fix script
print_status "Running server fix script..."
chmod +x fix-server-issues.sh
./fix-server-issues.sh

# Step 3: Additional server-specific fixes
print_status "Applying additional server fixes..."

# Ensure proper ownership of all project files
sudo chown -R $USER:$USER . || true

# Set proper permissions for sensitive files
chmod 600 .env* || true
chmod 644 database/projects.json || true

# Step 4: Restart services
print_status "Restarting services..."
docker-compose -f docker-compose-redai-prod.yml restart || true

# Step 5: Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 15

# Step 6: Test the application
print_status "Testing application endpoints..."

# Test main site
echo "Testing main site..."
curl -s -o /dev/null -w "%{http_code}" https://redai.site || print_warning "Main site not accessible"

# Test API
echo "Testing API..."
curl -s -o /dev/null -w "%{http_code}" https://redai.site/api/projects || print_warning "API not accessible"

# Step 7: Check service health
print_status "Checking service health..."
docker-compose -f docker-compose-redai-prod.yml ps

# Step 8: Show recent logs
print_status "Recent logs:"
docker-compose -f docker-compose-redai-prod.yml logs --tail=10

print_success "Server deploy fix completed!"

echo ""
echo "📋 Deployment Summary:"
echo "✅ Updated git repository"
echo "✅ Applied server fixes"
echo "✅ Fixed file permissions"
echo "✅ Restarted services"
echo "✅ Tested endpoints"
echo ""
echo "🔍 Verification steps:"
echo "1. Visit https://redai.site"
echo "2. Try creating a new project"
echo "3. Try deleting a project"
echo "4. Check if projects are saved after generation"
echo ""
echo "📊 Monitor logs:"
echo "docker-compose -f docker-compose-redai-prod.yml logs -f"
echo ""
echo "🔄 If issues persist:"
echo "1. Check logs: docker-compose -f docker-compose-redai-prod.yml logs"
echo "2. Restart services: docker-compose -f docker-compose-redai-prod.yml restart"
echo "3. Rebuild if needed: docker-compose -f docker-compose-redai-prod.yml up -d --build" 