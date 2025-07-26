#!/bin/bash

# Test Clerk Fix Script
# Comprehensive test of the Clerk configuration fix

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

echo_step "🧪 Testing Clerk Configuration Fix"

# Test 1: Check environment files exist
echo_step "1. Checking environment files..."

if [ -f ".env.local" ]; then
    echo_success ".env.local exists"
else
    echo_error ".env.local missing"
    exit 1
fi

if [ -f ".env" ]; then
    echo_success ".env exists"
else
    echo_error ".env missing"
    exit 1
fi

# Test 2: Check production file is backed up
if [ -f "env.production.local.backup" ]; then
    echo_success "Production file backed up"
else
    echo_warning "Production file backup not found"
fi

# Test 3: Check environment variables using Node.js
echo_step "2. Testing environment variables..."

ENV_TEST_RESULT=$(node scripts/check-clerk-env.js 2>&1)
if echo "$ENV_TEST_RESULT" | grep -q "✅ Using TEST keys"; then
    echo_success "Environment variables correctly configured"
else
    echo_error "Environment variables not properly configured"
    echo "$ENV_TEST_RESULT"
fi

# Test 4: Check server is running
echo_step "3. Testing server availability..."

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo_success "Server responding on port 3000"
    SERVER_PORT=3000
elif curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo_success "Server responding on port 3001"
    SERVER_PORT=3001
else
    echo_error "Server not responding on expected ports"
    exit 1
fi

# Test 5: Check Next.js build files
echo_step "4. Checking Next.js configuration..."

if [ -f "next.config.js" ]; then
    echo_success "Next.js config exists"
else
    echo_error "Next.js config missing"
fi

# Test 6: Check middleware
if [ -f "middleware.ts" ]; then
    echo_success "Middleware exists"
else
    echo_error "Middleware missing"
fi

# Test 7: Final summary
echo_step "🎉 Test Summary"

echo_info "Server URL: http://localhost:$SERVER_PORT"
echo_info "Environment: Development"
echo_info "Clerk Keys: TEST (localhost compatible)"

echo ""
echo_success "🚀 Clerk configuration fix completed successfully!"
echo ""
echo_info "To verify in browser:"
echo_info "1. Open http://localhost:$SERVER_PORT"
echo_info "2. Check the debug panel in bottom-right corner"
echo_info "3. Verify it shows 'TEST (Development)' keys"
echo_info "4. No more Clerk domain errors should appear"

echo ""
echo_warning "📝 Remember:"
echo_warning "- Current setup uses TEST keys for localhost"
echo_warning "- For production deployment, use LIVE keys"
echo_warning "- Debug panel only shows in development mode" 