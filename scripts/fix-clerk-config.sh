#!/bin/bash

# Fix Clerk Configuration Script
# This script fixes Clerk authentication issues

set -e

echo "🔧 Fixing Clerk Configuration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

echo_step() {
    echo -e "\n${YELLOW}📋 $1${NC}"
}

# Step 1: Check current environment
echo_step "Step 1: Checking current environment..."

if [ -f ".env" ]; then
    echo_success "Found .env file"
    
    # Check if Clerk keys are configured
    if grep -q "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env; then
        CLERK_KEY=$(grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env | cut -d'=' -f2)
        if [[ "$CLERK_KEY" == *"pk_live_"* ]]; then
            echo_success "Using production Clerk keys"
        elif [[ "$CLERK_KEY" == *"pk_test_"* ]]; then
            echo_warning "Using test Clerk keys"
        else
            echo_error "Invalid Clerk key format"
        fi
    else
        echo_error "Clerk publishable key not found in .env"
    fi
else
    echo_error ".env file not found"
    exit 1
fi

# Step 2: Check if webhook secret is configured
echo_step "Step 2: Checking webhook configuration..."

if ! grep -q "CLERK_WEBHOOK_SECRET" .env; then
    echo_warning "CLERK_WEBHOOK_SECRET not found in .env"
    echo "Please add CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here to your .env file"
fi

# Step 3: Check DNS configuration
echo_step "Step 3: Checking DNS configuration..."

DOMAIN="clerk.redai.site"
if nslookup $DOMAIN > /dev/null 2>&1; then
    echo_success "DNS resolution for $DOMAIN is working"
else
    echo_error "DNS resolution for $DOMAIN failed"
fi

# Step 4: Test Clerk API connectivity
echo_step "Step 4: Testing Clerk API connectivity..."

if curl -s -o /dev/null -w "%{http_code}" https://clerk.redai.site | grep -q "405\|200"; then
    echo_success "Clerk API is accessible"
else
    echo_error "Clerk API is not accessible"
fi

# Step 5: Check if webhook endpoint exists
echo_step "Step 5: Checking webhook endpoint..."

if [ -f "app/api/webhooks/clerk/route.ts" ]; then
    echo_success "Clerk webhook handler exists"
else
    echo_error "Clerk webhook handler not found"
fi

# Step 6: Check middleware configuration
echo_step "Step 6: Checking middleware configuration..."

if [ -f "middleware.ts" ]; then
    echo_success "Middleware file exists"
    
    if grep -q "clerkMiddleware" middleware.ts; then
        echo_success "Clerk middleware is configured"
    else
        echo_error "Clerk middleware not found in middleware.ts"
    fi
else
    echo_error "middleware.ts not found"
fi

# Step 7: Check package.json for Clerk dependencies
echo_step "Step 7: Checking Clerk dependencies..."

if [ -f "package.json" ]; then
    if grep -q "@clerk/nextjs" package.json; then
        echo_success "Clerk Next.js package is installed"
    else
        echo_error "Clerk Next.js package not found in package.json"
    fi
else
    echo_error "package.json not found"
fi

# Step 8: Recommendations
echo_step "Step 8: Recommendations"

echo "📋 To fix Clerk authentication issues:"
echo "1. Ensure your .env file has correct Clerk keys"
echo "2. Add CLERK_WEBHOOK_SECRET to your .env file"
echo "3. Configure webhook URL in Clerk dashboard: https://redai.site/api/webhooks/clerk"
echo "4. Restart your development server"
echo "5. Clear browser cache and cookies"

echo_success "Configuration check completed!" 