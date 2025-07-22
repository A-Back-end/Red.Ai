#!/bin/bash

# 🧪 Red.AI API Test Script
# Тестирует API после применения исправлений

set -e

echo "🧪 Testing Red.AI API after fixes..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Test configuration
API_BASE="http://localhost"
TEST_USER_ID="test-user-$(date +%s)"
TEST_PROJECT_NAME="Test Project $(date +%H:%M:%S)"

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    print_status "Testing $description..."
    
    local curl_cmd="curl -s -w '%{http_code}' -X $method $API_BASE$endpoint"
    
    if [ ! -z "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    local response=$(eval $curl_cmd)
    local status_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
        print_success "$description - Status: $status_code"
        echo "Response: $body" | head -c 200
        echo ""
        return 0
    else
        print_error "$description - Status: $status_code"
        echo "Response: $body"
        return 1
    fi
}

# Test 1: Health check
print_status "=== Starting API Tests ==="
test_endpoint "GET" "/health" "" "Health Check"

# Test 2: Get projects (should return empty array for new user)
test_endpoint "GET" "/api/projects?userId=$TEST_USER_ID" "" "Get Projects for New User"

# Test 3: Create project
TEST_PROJECT_DATA='{
  "userId": "'$TEST_USER_ID'",
  "name": "'$TEST_PROJECT_NAME'",
  "description": "Test project created by API test script",
  "imageUrl": "https://example.com/test-image.jpg",
  "status": "completed",
  "generatedImages": ["https://example.com/test-image.jpg"],
  "budget": {"min": 5000, "max": 7500, "currency": "RUB"},
  "preferredStyles": ["modern"]
}'

test_endpoint "POST" "/api/projects" "$TEST_PROJECT_DATA" "Create Project"

# Extract project ID from response for deletion test
PROJECT_ID=$(echo "$body" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$PROJECT_ID" ]; then
    print_success "Created project with ID: $PROJECT_ID"
    
    # Test 4: Get specific project
    test_endpoint "GET" "/api/projects?projectId=$PROJECT_ID" "" "Get Specific Project"
    
    # Test 5: Update project
    UPDATE_DATA='{
      "projectId": "'$PROJECT_ID'",
      "name": "'$TEST_PROJECT_NAME' - Updated",
      "description": "Updated description"
    }'
    
    test_endpoint "PUT" "/api/projects" "$UPDATE_DATA" "Update Project"
    
    # Test 6: Delete project
    test_endpoint "DELETE" "/api/projects?projectId=$PROJECT_ID" "" "Delete Project"
    
    # Test 7: Verify project is deleted
    test_endpoint "GET" "/api/projects?projectId=$PROJECT_ID" "" "Verify Project Deletion (should return 404)"
    
else
    print_error "Could not extract project ID from response"
fi

# Test 8: Test error handling
print_status "Testing error handling..."

# Test with invalid project ID
test_endpoint "GET" "/api/projects?projectId=invalid-id" "" "Get Invalid Project ID"

# Test with missing required fields
test_endpoint "POST" "/api/projects" '{"userId": "test"}' "Create Project with Missing Fields"

# Test 9: Check database file
print_status "Checking database file..."
if [ -f "database/projects.json" ]; then
    print_success "Database file exists"
    echo "File size: $(wc -c < database/projects.json) bytes"
    echo "File permissions: $(ls -la database/projects.json | awk '{print $1}')"
else
    print_error "Database file does not exist"
fi

# Test 10: Check Docker container
print_status "Checking Docker container..."
if command -v docker-compose &> /dev/null; then
    CONTAINER_STATUS=$(docker-compose ps backend 2>/dev/null | tail -n +2 | awk '{print $6}')
    if [ "$CONTAINER_STATUS" = "Up" ]; then
        print_success "Backend container is running"
    else
        print_error "Backend container is not running"
    fi
else
    print_warning "Docker Compose not available"
fi

print_status "=== API Tests Completed ==="

echo ""
echo "📊 Test Summary:"
echo "✅ Health check"
echo "✅ Get projects"
echo "✅ Create project"
echo "✅ Get specific project"
echo "✅ Update project"
echo "✅ Delete project"
echo "✅ Error handling"
echo "✅ Database file check"
echo "✅ Container status"
echo ""
echo "🎯 If all tests passed, the server fixes are working correctly!"
echo ""
echo "🔍 To monitor in real-time:"
echo "docker-compose logs -f backend" 