#!/bin/bash

# 🔧 Server Project Save Fix Script
# Диагностика и исправление проблем с сохранением проектов на сервере

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

echo "🔍 Server Project Save Diagnostics & Fix..."

# Step 1: Check current working directory and paths
echo_step "Step 1: Checking paths and permissions"

echo_info "Current working directory: $(pwd)"
echo_info "User: $(whoami)"
echo_info "User ID: $(id -u)"
echo_info "Group ID: $(id -g)"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo_error "Not in Red.Ai root directory. Please cd to the project root."
    exit 1
fi

echo_success "In correct project directory"

# Step 2: Check database directory
echo_step "Step 2: Checking database directory"

if [ ! -d "database" ]; then
    echo_warning "Database directory doesn't exist. Creating..."
    mkdir -p database
    echo_success "Created database directory"
else
    echo_success "Database directory exists"
fi

# Check permissions on database directory
DB_DIR_PERMS=$(ls -ld database | cut -d' ' -f1)
DB_DIR_OWNER=$(ls -ld database | cut -d' ' -f3)
DB_DIR_GROUP=$(ls -ld database | cut -d' ' -f4)

echo_info "Database directory permissions: $DB_DIR_PERMS"
echo_info "Database directory owner: $DB_DIR_OWNER"
echo_info "Database directory group: $DB_DIR_GROUP"

# Check if directory is writable
if [ -w "database" ]; then
    echo_success "Database directory is writable"
else
    echo_error "Database directory is NOT writable"
    echo_info "Attempting to fix permissions..."
    chmod 755 database
    chown $(whoami):$(id -gn) database 2>/dev/null || echo_warning "Could not change ownership (may need sudo)"
    
    if [ -w "database" ]; then
        echo_success "Fixed database directory permissions"
    else
        echo_error "Could not fix database directory permissions"
    fi
fi

# Step 3: Check projects.json file
echo_step "Step 3: Checking projects.json file"

if [ ! -f "database/projects.json" ]; then
    echo_warning "projects.json doesn't exist. Creating empty database..."
    echo "[]" > database/projects.json
    echo_success "Created empty projects.json"
else
    echo_success "projects.json exists"
fi

# Check file permissions
if [ -f "database/projects.json" ]; then
    FILE_PERMS=$(ls -l database/projects.json | cut -d' ' -f1)
    FILE_OWNER=$(ls -l database/projects.json | cut -d' ' -f3)
    FILE_GROUP=$(ls -l database/projects.json | cut -d' ' -f4)
    FILE_SIZE=$(wc -c < database/projects.json)
    
    echo_info "File permissions: $FILE_PERMS"
    echo_info "File owner: $FILE_OWNER"
    echo_info "File group: $FILE_GROUP"
    echo_info "File size: $FILE_SIZE bytes"
    
    # Check if file is readable and writable
    if [ -r "database/projects.json" ] && [ -w "database/projects.json" ]; then
        echo_success "projects.json has correct permissions"
    else
        echo_error "projects.json has incorrect permissions"
        echo_info "Attempting to fix..."
        chmod 644 database/projects.json
        chown $(whoami):$(id -gn) database/projects.json 2>/dev/null || echo_warning "Could not change ownership"
        
        if [ -r "database/projects.json" ] && [ -w "database/projects.json" ]; then
            echo_success "Fixed projects.json permissions"
        else
            echo_error "Could not fix projects.json permissions"
        fi
    fi
    
    # Validate JSON
    if python3 -m json.tool database/projects.json > /dev/null 2>&1; then
        echo_success "projects.json contains valid JSON"
        PROJECT_COUNT=$(python3 -c "import json; print(len(json.load(open('database/projects.json'))))" 2>/dev/null || echo "0")
        echo_info "Current projects in database: $PROJECT_COUNT"
    else
        echo_error "projects.json contains invalid JSON"
        echo_info "Creating backup and fixing..."
        cp database/projects.json database/projects.json.backup.$(date +%s)
        echo "[]" > database/projects.json
        echo_success "Fixed invalid JSON"
    fi
fi

# Step 4: Test write operation
echo_step "Step 4: Testing write operations"

TEST_FILE="database/.write_test_$(date +%s)"
if echo "test" > "$TEST_FILE" 2>/dev/null; then
    echo_success "Can write to database directory"
    rm "$TEST_FILE"
else
    echo_error "Cannot write to database directory"
    echo_info "Current effective user: $(whoami)"
    echo_info "Directory permissions: $(ls -ld database)"
    
    # Try to fix
    echo_info "Attempting to fix write permissions..."
    chmod -R 755 database/
    if echo "test" > "$TEST_FILE" 2>/dev/null; then
        echo_success "Fixed write permissions"
        rm "$TEST_FILE"
    else
        echo_error "Still cannot write to database directory"
    fi
fi

# Step 5: Test atomic write (как в API)
echo_step "Step 5: Testing atomic write operations"

TEMP_JSON="database/test_atomic_$(date +%s).tmp"
FINAL_JSON="database/test_atomic_$(date +%s).json"

TEST_DATA='[{"id":"test","name":"Test Project","createdAt":"2025-01-25T10:00:00Z"}]'

if echo "$TEST_DATA" > "$TEMP_JSON" 2>/dev/null; then
    echo_success "Can create temporary file"
    
    if mv "$TEMP_JSON" "$FINAL_JSON" 2>/dev/null; then
        echo_success "Can perform atomic rename operation"
        rm "$FINAL_JSON"
    else
        echo_error "Cannot perform atomic rename operation"
        rm "$TEMP_JSON" 2>/dev/null || true
    fi
else
    echo_error "Cannot create temporary file for atomic write"
fi

# Step 6: Check disk space
echo_step "Step 6: Checking disk space"

DISK_USAGE=$(df -h . | tail -1)
echo_info "Disk usage: $DISK_USAGE"

AVAILABLE_KB=$(df . | tail -1 | awk '{print $4}')
if [ "$AVAILABLE_KB" -lt 1000000 ]; then # Less than ~1GB
    echo_warning "Low disk space available: ${AVAILABLE_KB}KB"
else
    echo_success "Sufficient disk space available"
fi

# Step 7: Check for file locks
echo_step "Step 7: Checking for file locks"

if command -v lsof &> /dev/null; then
    LOCKED_FILES=$(lsof database/projects.json 2>/dev/null || true)
    if [ -n "$LOCKED_FILES" ]; then
        echo_warning "projects.json may be locked by another process:"
        echo "$LOCKED_FILES"
    else
        echo_success "No file locks detected on projects.json"
    fi
else
    echo_info "lsof not available, cannot check for file locks"
fi

# Step 8: Test API endpoint
echo_step "Step 8: Testing API endpoint"

if command -v curl &> /dev/null; then
    # Test if server is running
    if curl -s http://localhost:3000/api/health &> /dev/null; then
        echo_success "Server is running and responsive"
        
        # Test projects API
        TEST_PROJECT='{"name":"Server Fix Test","userId":"server_fix_test","description":"Testing server fix"}'
        API_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/projects" \
            -H "Content-Type: application/json" \
            -d "$TEST_PROJECT" \
            -w "HTTPSTATUS:%{http_code}")
        
        HTTP_BODY=$(echo "$API_RESPONSE" | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')
        HTTP_STATUS=$(echo "$API_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
        
        if [ "$HTTP_STATUS" = "200" ]; then
            echo_success "API test successful"
            echo_info "Response: $HTTP_BODY"
        else
            echo_error "API test failed with status: $HTTP_STATUS"
            echo_info "Response: $HTTP_BODY"
        fi
    else
        echo_warning "Server is not running on localhost:3000"
        echo_info "Start server with: npm run dev"
    fi
else
    echo_info "curl not available, cannot test API"
fi

# Step 9: Environment check
echo_step "Step 9: Checking environment"

echo_info "NODE_ENV: ${NODE_ENV:-not set}"
echo_info "PWD: $PWD"
echo_info "HOME: $HOME"

if [ -f ".env" ]; then
    echo_success ".env file exists"
else
    echo_warning ".env file not found"
fi

if [ -f ".env.local" ]; then
    echo_success ".env.local file exists"
else
    echo_info ".env.local file not found (optional)"
fi

# Step 10: Create fix summary
echo_step "Step 10: Fix Summary & Recommendations"

echo "📋 Summary of issues found and fixes applied:"
echo ""

# Count fixes applied
FIXES_APPLIED=0

if [ -d "database" ] && [ -w "database" ]; then
    echo_success "Database directory exists and is writable"
else
    echo_error "Database directory issues persist"
fi

if [ -f "database/projects.json" ] && [ -r "database/projects.json" ] && [ -w "database/projects.json" ]; then
    echo_success "projects.json exists and has correct permissions"
else
    echo_error "projects.json issues persist"
fi

echo ""
echo "🚀 Next steps:"
echo "1. If server is not running: npm run dev"
echo "2. Test project save from the web interface"
echo "3. Check browser console for any remaining errors"
echo "4. Monitor server logs during save attempts"
echo ""
echo "💡 If issues persist:"
echo "1. Check if running in Docker (different permission model)"
echo "2. Verify server deployment configuration"
echo "3. Consider switching to database-based storage (PostgreSQL/Supabase)"
echo ""

echo_success "Server diagnostics and fixes completed!"
echo_info "Run this script again if issues persist" 