#!/bin/bash

# Quick deployment script for RedAI Projects API fix
set -e

echo "🚀 Deploying RedAI Projects API fix..."

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
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "docker-compose.prod.yml not found. Please run this script from the RedAI project root."
    exit 1
fi

# Check if nginx config exists
if [ ! -f "nginx-redai-fixed.conf" ]; then
    print_error "nginx-redai-fixed.conf not found. Please ensure the fixed nginx configuration exists."
    exit 1
fi

print_status "Stopping current containers..."
docker-compose -f docker-compose.prod.yml down

print_status "Building and starting containers with fixed configuration..."
docker-compose -f docker-compose.prod.yml up -d --build

print_status "Waiting for services to start..."
sleep 10

print_status "Checking container status..."
docker-compose -f docker-compose.prod.yml ps

print_status "Testing nginx configuration..."
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

if [ $? -eq 0 ]; then
    print_success "Nginx configuration is valid"
else
    print_error "Nginx configuration is invalid"
    exit 1
fi

print_status "Testing API endpoint..."
# Wait a bit more for services to be fully ready
sleep 5

# Test the API endpoint
TEST_RESPONSE=$(curl -s -X POST https://redai.site/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Deployment Test","description":"Testing deployment","userId":"deploy-test"}' \
  -w "%{http_code}" \
  -o /tmp/api_response.json)

if [ "$TEST_RESPONSE" = "200" ]; then
    print_success "API endpoint is working correctly!"
    print_status "Response:"
    cat /tmp/api_response.json | jq '.' 2>/dev/null || cat /tmp/api_response.json
else
    print_warning "API endpoint returned status $TEST_RESPONSE"
    print_status "Response:"
    cat /tmp/api_response.json
fi

print_success "Deployment completed!"
print_status "You can now test the API with:"
echo "curl -X POST https://redai.site/api/projects -H 'Content-Type: application/json' -d '{\"name\":\"Test\",\"userId\":\"test\"}'"

# Cleanup
rm -f /tmp/api_response.json 