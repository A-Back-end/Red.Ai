#!/bin/bash

# 🔧 Quick Server Fix for Red.Ai Projects Saving
# Исправляет права доступа к database/projects.json на сервере

set -e

echo "🔧 Quick fix for Red.Ai projects saving issue..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo_success() { echo -e "${GREEN}✅ $1${NC}"; }
echo_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
echo_error() { echo -e "${RED}❌ $1${NC}"; }
echo_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Check if we're on the server
if [ ! -f "/app/package.json" ] && [ ! -f "package.json" ]; then
    echo_error "Not in a Red.Ai project directory"
    echo_info "Run this script on the server in the project directory"
    exit 1
fi

# Determine project directory
if [ -f "/app/package.json" ]; then
    PROJECT_DIR="/app"
    echo_info "Detected Docker environment: $PROJECT_DIR"
else
    PROJECT_DIR="$(pwd)"
    echo_info "Detected local environment: $PROJECT_DIR"
fi

cd "$PROJECT_DIR"

echo_info "Current user: $(whoami)"
echo_info "User ID: $(id -u)"
echo_info "Group ID: $(id -g)"

# Fix 1: Create database directory if missing
if [ ! -d "database" ]; then
    echo_warning "Creating database directory..."
    mkdir -p database
    echo_success "Database directory created"
fi

# Fix 2: Set proper permissions on directory
echo_info "Setting directory permissions..."
chmod 755 database
echo_success "Directory permissions set to 755"

# Fix 3: Create projects.json if missing
if [ ! -f "database/projects.json" ]; then
    echo_warning "Creating projects.json file..."
    echo "[]" > database/projects.json
    echo_success "Empty projects.json created"
fi

# Fix 4: Set proper permissions on file
echo_info "Setting file permissions..."
chmod 644 database/projects.json
echo_success "File permissions set to 644"

# Fix 5: Change ownership if possible
echo_info "Attempting to fix ownership..."
if chown $(whoami):$(id -gn) database/ database/projects.json 2>/dev/null; then
    echo_success "Ownership updated"
else
    echo_warning "Could not change ownership (may need root access)"
fi

# Fix 6: Test write operation
echo_info "Testing write operation..."
if echo "test" > database/.write_test 2>/dev/null; then
    rm database/.write_test
    echo_success "Write test successful"
else
    echo_error "Still cannot write to database directory"
    
    # Alternative fixes for Docker/container environments
    echo_warning "Trying alternative fixes for container environment..."
    
    # Try with different permissions
    chmod 777 database/ 2>/dev/null || true
    chmod 666 database/projects.json 2>/dev/null || true
    
    if echo "test" > database/.write_test 2>/dev/null; then
        rm database/.write_test
        echo_success "Alternative permissions worked"
    else
        echo_error "Cannot fix write permissions automatically"
        echo_info "Manual steps required:"
        echo "  1. Check if running in Docker with volume mounts"
        echo "  2. Verify Docker user permissions"
        echo "  3. Consider switching to Supabase (recommended)"
    fi
fi

# Fix 7: Show current status
echo_info "Current status:"
ls -la database/
echo ""

# Fix 8: Test API if server is running
echo_info "Testing API endpoint..."
if curl -s http://localhost:3000/api/health &> /dev/null; then
    echo_success "Server is running"
    
    # Test projects API
    TEST_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/projects" \
        -H "Content-Type: application/json" \
        -d '{"name":"Quick Fix Test","userId":"quickfix","description":"Testing after permissions fix"}' \
        -w "HTTPSTATUS:%{http_code}")
    
    HTTP_STATUS=$(echo "$TEST_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo_success "✅ PROBLEM FIXED! Projects can now be saved"
    else
        echo_warning "API still returns error $HTTP_STATUS"
        echo_info "Try switching to Supabase: ./scripts/setup-supabase.sh"
    fi
else
    echo_info "Server not running. Start with: npm run dev"
fi

echo ""
echo_success "Quick fix completed!"
echo_info "If problems persist, use Supabase: ./scripts/setup-supabase.sh" 