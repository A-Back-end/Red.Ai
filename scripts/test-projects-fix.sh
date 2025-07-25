#!/bin/bash

# Test Projects API Fix Script
# This script tests the improved projects API with better error handling

set -e

echo "🧪 Testing Projects API Fixes..."

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

# Test data
TEST_USER_ID="test_user_$(date +%s)"
TEST_PROJECT_NAME="Test Project $(date +%H:%M:%S)"

# Step 1: Test GET projects
echo_step "Step 1: Testing GET /api/projects"

GET_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/projects?userId=$TEST_USER_ID" -H "Content-Type: application/json")
GET_STATUS=$?

if [ $GET_STATUS -eq 0 ]; then
    echo_success "GET request successful"
    echo_info "Response: $GET_RESPONSE"
else
    echo_error "GET request failed with status $GET_STATUS"
fi

# Step 2: Test POST project creation
echo_step "Step 2: Testing POST /api/projects"

POST_DATA="{\"name\":\"$TEST_PROJECT_NAME\",\"userId\":\"$TEST_USER_ID\",\"description\":\"Test project for API fix\"}"
POST_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/projects" -H "Content-Type: application/json" -d "$POST_DATA")
POST_STATUS=$?

if [ $POST_STATUS -eq 0 ]; then
    echo_success "POST request successful"
    echo_info "Response: $POST_RESPONSE"
    
    # Extract project ID from response
    PROJECT_ID=$(echo "$POST_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$PROJECT_ID" ]; then
        echo_success "Project ID extracted: $PROJECT_ID"
    else
        echo_warning "Could not extract project ID from response"
    fi
else
    echo_error "POST request failed with status $POST_STATUS"
    PROJECT_ID=""
fi

# Step 3: Test GET specific project
if [ -n "$PROJECT_ID" ]; then
    echo_step "Step 3: Testing GET specific project"
    
    GET_SPECIFIC_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/projects?projectId=$PROJECT_ID" -H "Content-Type: application/json")
    GET_SPECIFIC_STATUS=$?
    
    if [ $GET_SPECIFIC_STATUS -eq 0 ]; then
        echo_success "GET specific project successful"
        echo_info "Response: $GET_SPECIFIC_RESPONSE"
    else
        echo_error "GET specific project failed with status $GET_SPECIFIC_STATUS"
    fi
else
    echo_warning "Skipping GET specific project test - no project ID available"
fi

# Step 4: Test PUT project update
if [ -n "$PROJECT_ID" ]; then
    echo_step "Step 4: Testing PUT /api/projects"
    
    UPDATE_DATA="{\"projectId\":\"$PROJECT_ID\",\"name\":\"Updated $TEST_PROJECT_NAME\",\"status\":\"completed\"}"
    PUT_RESPONSE=$(curl -s -X PUT "http://localhost:3000/api/projects" -H "Content-Type: application/json" -d "$UPDATE_DATA")
    PUT_STATUS=$?
    
    if [ $PUT_STATUS -eq 0 ]; then
        echo_success "PUT request successful"
        echo_info "Response: $PUT_RESPONSE"
    else
        echo_error "PUT request failed with status $PUT_STATUS"
    fi
else
    echo_warning "Skipping PUT test - no project ID available"
fi

# Step 5: Test DELETE project
if [ -n "$PROJECT_ID" ]; then
    echo_step "Step 5: Testing DELETE /api/projects"
    
    DELETE_RESPONSE=$(curl -s -X DELETE "http://localhost:3000/api/projects?projectId=$PROJECT_ID" -H "Content-Type: application/json")
    DELETE_STATUS=$?
    
    if [ $DELETE_STATUS -eq 0 ]; then
        echo_success "DELETE request successful"
        echo_info "Response: $DELETE_RESPONSE"
    else
        echo_error "DELETE request failed with status $DELETE_STATUS"
    fi
else
    echo_warning "Skipping DELETE test - no project ID available"
fi

# Step 6: Test error handling
echo_step "Step 6: Testing error handling"

# Test invalid JSON
INVALID_JSON_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/projects" -H "Content-Type: application/json" -d "{invalid json}")
INVALID_JSON_STATUS=$?

if [ $INVALID_JSON_STATUS -eq 0 ]; then
    echo_info "Invalid JSON response: $INVALID_JSON_RESPONSE"
    if echo "$INVALID_JSON_RESPONSE" | grep -q "Invalid JSON"; then
        echo_success "Invalid JSON properly handled"
    else
        echo_warning "Invalid JSON not properly handled"
    fi
else
    echo_error "Invalid JSON test failed with status $INVALID_JSON_STATUS"
fi

# Test missing required fields
MISSING_FIELDS_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/projects" -H "Content-Type: application/json" -d "{\"userId\":\"test\"}")
MISSING_FIELDS_STATUS=$?

if [ $MISSING_FIELDS_STATUS -eq 0 ]; then
    echo_info "Missing fields response: $MISSING_FIELDS_RESPONSE"
    if echo "$MISSING_FIELDS_RESPONSE" | grep -q "Invalid project data"; then
        echo_success "Missing fields properly handled"
    else
        echo_warning "Missing fields not properly handled"
    fi
else
    echo_error "Missing fields test failed with status $MISSING_FIELDS_STATUS"
fi

# Step 7: Check database file
echo_step "Step 7: Checking database file"

if [ -f "database/projects.json" ]; then
    echo_success "Database file exists"
    
    # Check if file is valid JSON
    if python3 -m json.tool "database/projects.json" > /dev/null 2>&1; then
        echo_success "Database file contains valid JSON"
        
        # Count projects
        PROJECT_COUNT=$(python3 -c "import json; print(len(json.load(open('database/projects.json'))))" 2>/dev/null || echo "0")
        echo_info "Database contains $PROJECT_COUNT projects"
    else
        echo_error "Database file contains invalid JSON"
    fi
    
    # Check file permissions
    if [ -r "database/projects.json" ] && [ -w "database/projects.json" ]; then
        echo_success "Database file has correct permissions"
    else
        echo_error "Database file has incorrect permissions"
    fi
else
    echo_error "Database file does not exist"
fi

# Step 8: Check for backup files
echo_step "Step 8: Checking backup files"

BACKUP_COUNT=$(ls -1 database/projects.json.backup.* 2>/dev/null | wc -l)
if [ $BACKUP_COUNT -gt 0 ]; then
    echo_success "Found $BACKUP_COUNT backup files"
    ls -la database/projects.json.backup.* 2>/dev/null | head -3
else
    echo_info "No backup files found (this is normal for new installations)"
fi

echo_success "Projects API fix testing completed!" 