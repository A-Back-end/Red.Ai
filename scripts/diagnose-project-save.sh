#!/bin/bash

# Diagnose Project Save Issues Script
# This script helps identify why projects are not saving properly

set -e

echo "🔍 Diagnosing Project Save Issues..."

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

# Step 1: Check if server is running
echo_step "Step 1: Checking server status"

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo_success "Server is running on localhost:3000"
else
    echo_error "Server is not running on localhost:3000"
    echo_info "Please start the server with: npm run dev"
    exit 1
fi

# Step 2: Check API endpoint
echo_step "Step 2: Testing API endpoint"

API_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/projects?userId=test" -H "Content-Type: application/json")
API_STATUS=$?

if [ $API_STATUS -eq 0 ]; then
    echo_success "API endpoint is accessible"
    echo_info "Response: $API_RESPONSE"
else
    echo_error "API endpoint is not accessible"
    echo_info "Status: $API_STATUS"
fi

# Step 3: Test project creation
echo_step "Step 3: Testing project creation"

TEST_PROJECT='{"name":"Diagnostic Test","userId":"diagnostic_user","description":"Test project for diagnostics"}'
CREATE_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/projects" -H "Content-Type: application/json" -d "$TEST_PROJECT")
CREATE_STATUS=$?

if [ $CREATE_STATUS -eq 0 ]; then
    echo_success "Project creation test successful"
    echo_info "Response: $CREATE_RESPONSE"
    
    # Extract project ID
    PROJECT_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$PROJECT_ID" ]; then
        echo_success "Project ID: $PROJECT_ID"
    fi
else
    echo_error "Project creation test failed"
    echo_info "Status: $CREATE_STATUS"
fi

# Step 4: Check database file
echo_step "Step 4: Checking database file"

if [ -f "database/projects.json" ]; then
    echo_success "Database file exists"
    
    # Check file size
    FILE_SIZE=$(wc -c < "database/projects.json")
    echo_info "File size: $FILE_SIZE bytes"
    
    # Check if it's valid JSON
    if python3 -m json.tool "database/projects.json" > /dev/null 2>&1; then
        echo_success "Database file contains valid JSON"
        
        # Count projects
        PROJECT_COUNT=$(python3 -c "import json; print(len(json.load(open('database/projects.json'))))" 2>/dev/null || echo "0")
        echo_info "Total projects in database: $PROJECT_COUNT"
    else
        echo_error "Database file contains invalid JSON"
    fi
    
    # Check permissions
    if [ -r "database/projects.json" ] && [ -w "database/projects.json" ]; then
        echo_success "Database file has correct permissions"
    else
        echo_error "Database file has incorrect permissions"
        ls -la database/projects.json
    fi
else
    echo_error "Database file does not exist"
fi

# Step 5: Check environment variables
echo_step "Step 5: Checking environment variables"

if [ -f ".env" ]; then
    echo_success ".env file exists"
    
    # Check for Clerk keys
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
        echo_error "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not found in .env"
    fi
    
    if grep -q "CLERK_SECRET_KEY" .env; then
        echo_success "CLERK_SECRET_KEY found in .env"
    else
        echo_error "CLERK_SECRET_KEY not found in .env"
    fi
else
    echo_error ".env file not found"
fi

# Step 6: Check for recent errors in logs
echo_step "Step 6: Checking for recent errors"

# Check if there are any error logs
if [ -d "logs" ]; then
    echo_info "Logs directory exists"
    ls -la logs/ 2>/dev/null || echo_info "No log files found"
else
    echo_info "No logs directory found"
fi

# Step 7: Test with different user scenarios
echo_step "Step 7: Testing different user scenarios"

# Test with anonymous user
echo_info "Testing with anonymous user..."
ANON_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/projects" -H "Content-Type: application/json" -d '{"name":"Anonymous Test","description":"Test without userId"}')
echo_info "Anonymous response: $ANON_RESPONSE"

# Test with invalid data
echo_info "Testing with invalid data..."
INVALID_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/projects" -H "Content-Type: application/json" -d '{"userId":"test"}')
echo_info "Invalid data response: $INVALID_RESPONSE"

# Step 8: Check network connectivity
echo_step "Step 8: Checking network connectivity"

# Test DNS resolution
if nslookup localhost > /dev/null 2>&1; then
    echo_success "localhost DNS resolution works"
else
    echo_error "localhost DNS resolution failed"
fi

# Test port connectivity
if nc -z localhost 3000 2>/dev/null; then
    echo_success "Port 3000 is accessible"
else
    echo_error "Port 3000 is not accessible"
fi

# Step 9: Recommendations
echo_step "Step 9: Recommendations"

echo "📋 Based on the diagnostics, here are the recommendations:"
echo ""
echo "1. If server is not running:"
echo "   npm run dev"
echo ""
echo "2. If API is not accessible:"
echo "   - Check if Next.js is running"
echo "   - Check for port conflicts"
echo "   - Restart the development server"
echo ""
echo "3. If database file has issues:"
echo "   - Check file permissions"
echo "   - Verify JSON syntax"
echo "   - Create backup and regenerate"
echo ""
echo "4. If Clerk authentication issues:"
echo "   - Verify Clerk keys in .env"
echo "   - Check Clerk dashboard configuration"
echo "   - Ensure webhook is configured"
echo ""
echo "5. If projects are not saving:"
echo "   - Check browser console for errors"
echo "   - Verify user authentication"
echo "   - Test with the debugger component"
echo ""
echo "6. For production issues:"
echo "   - Check server logs"
echo "   - Verify environment variables"
echo "   - Test with curl commands"

echo_success "Diagnostics completed!" 