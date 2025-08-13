#!/bin/bash

# Диагностика проблем с сохранением изображений
# Этот скрипт проверяет все аспекты сохранения изображений

set -e

echo "🔍 Diagnosing Image Save Issues..."

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

# Step 1: Check file system permissions
echo_step "Step 1: Checking file system permissions..."

SAVE_DIR="public/generated-images"
if [ -d "$SAVE_DIR" ]; then
    echo_success "Save directory exists: $SAVE_DIR"
    
    # Check write permissions
    if [ -w "$SAVE_DIR" ]; then
        echo_success "Write permissions: OK"
    else
        echo_error "Write permissions: DENIED"
        echo_info "Run: chmod 755 $SAVE_DIR"
    fi
    
    # Check disk space
    AVAILABLE_SPACE=$(df "$SAVE_DIR" | awk 'NR==2 {print $4}')
    echo_info "Available disk space: ${AVAILABLE_SPACE}KB"
    
    if [ "$AVAILABLE_SPACE" -lt 100000 ]; then
        echo_warning "Low disk space detected"
    else
        echo_success "Disk space: OK"
    fi
else
    echo_warning "Save directory does not exist: $SAVE_DIR"
    echo_info "Creating directory..."
    mkdir -p "$SAVE_DIR"
    if [ $? -eq 0 ]; then
        echo_success "Directory created successfully"
    else
        echo_error "Failed to create directory"
    fi
fi

# Step 2: Check environment variables
echo_step "Step 2: Checking environment variables..."

# Check if .env file exists
if [ -f ".env" ]; then
    echo_success ".env file exists"
    
    # Check AWS S3 configuration
    if grep -q "AWS_" .env; then
        echo_info "AWS S3 configuration found"
        
        # Check specific AWS variables
        if grep -q "AWS_REGION" .env; then
            echo_success "AWS_REGION: configured"
        else
            echo_warning "AWS_REGION: not configured"
        fi
        
        if grep -q "AWS_ACCESS_KEY_ID" .env; then
            echo_success "AWS_ACCESS_KEY_ID: configured"
        else
            echo_warning "AWS_ACCESS_KEY_ID: not configured"
        fi
        
        if grep -q "AWS_SECRET_ACCESS_KEY" .env; then
            echo_success "AWS_SECRET_ACCESS_KEY: configured"
        else
            echo_warning "AWS_SECRET_ACCESS_KEY: not configured"
        fi
        
        if grep -q "AWS_S3_BUCKET_NAME" .env; then
            echo_success "AWS_S3_BUCKET_NAME: configured"
        else
            echo_warning "AWS_S3_BUCKET_NAME: not configured"
        fi
    else
        echo_info "AWS S3 not configured, will use local storage"
    fi
else
    echo_error ".env file not found"
fi

# Step 3: Check Node.js dependencies
echo_step "Step 3: Checking Node.js dependencies..."

if [ -f "package.json" ]; then
    echo_success "package.json exists"
    
    # Check if required packages are installed
    if npm list fs > /dev/null 2>&1; then
        echo_success "fs module: available"
    else
        echo_warning "fs module: not available"
    fi
    
    if npm list path > /dev/null 2>&1; then
        echo_success "path module: available"
    else
        echo_warning "path module: not available"
    fi
    
    if npm list @aws-sdk/client-s3 > /dev/null 2>&1; then
        echo_success "@aws-sdk/client-s3: installed"
    else
        echo_warning "@aws-sdk/client-s3: not installed"
    fi
else
    echo_error "package.json not found"
fi

# Step 4: Check API endpoint
echo_step "Step 4: Checking API endpoint..."

if [ -f "app/api/save-image/route.ts" ]; then
    echo_success "save-image API endpoint exists"
    
    # Check if endpoint has proper error handling
    if grep -q "console.error" "app/api/save-image/route.ts"; then
        echo_success "Error logging: implemented"
    else
        echo_warning "Error logging: not implemented"
    fi
    
    if grep -q "fs.writeFileSync" "app/api/save-image/route.ts"; then
        echo_success "File writing: implemented"
    else
        echo_error "File writing: not implemented"
    fi
else
    echo_error "save-image API endpoint not found"
fi

# Step 5: Check network connectivity
echo_step "Step 5: Checking network connectivity..."

# Test basic internet connectivity
if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
    echo_success "Internet connectivity: OK"
else
    echo_error "Internet connectivity: FAILED"
fi

# Test DNS resolution
if nslookup google.com > /dev/null 2>&1; then
    echo_success "DNS resolution: OK"
else
    echo_error "DNS resolution: FAILED"
fi

# Step 6: Check server status
echo_step "Step 6: Checking server status..."

# Check if server is running
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo_success "Server is running on localhost:3000"
else
    echo_warning "Server is not running on localhost:3000"
    echo_info "Start server with: npm run dev"
fi

# Step 7: Test image download
echo_step "Step 7: Testing image download..."

# Test with a simple image
TEST_IMAGE_URL="https://httpbin.org/image/png"
echo_info "Testing download from: $TEST_IMAGE_URL"

if curl -s -o /dev/null -w "%{http_code}" "$TEST_IMAGE_URL" | grep -q "200"; then
    echo_success "Image download test: OK"
else
    echo_error "Image download test: FAILED"
fi

# Step 8: Check logs
echo_step "Step 8: Checking for recent errors..."

# Look for error logs in the project
if [ -d "logs" ]; then
    echo_info "Checking logs directory..."
    find logs -name "*.log" -mtime -1 -exec grep -l "error\|Error\|ERROR" {} \; 2>/dev/null || echo_info "No recent error logs found"
else
    echo_info "No logs directory found"
fi

# Step 9: Recommendations
echo_step "Step 9: Recommendations"

echo "📋 To fix image save issues:"
echo ""
echo "1. Ensure write permissions:"
echo "   chmod 755 public/generated-images"
echo ""
echo "2. Check disk space:"
echo "   df -h public/generated-images"
echo ""
echo "3. Test the API endpoint:"
echo "   node scripts/test-image-save.js"
echo ""
echo "4. Check server logs:"
echo "   npm run dev"
echo ""
echo "5. Verify environment variables:"
echo "   cat .env | grep AWS_"
echo ""

echo_success "Diagnosis completed!" 