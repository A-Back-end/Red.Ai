#!/bin/bash

# 🚀 Deploy Projects Save Fix to Server
# Быстрый деплой исправлений для проблемы сохранения проектов

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

echo "🚀 Deploying Projects Save Fix to Server..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo_error "Not in Red.Ai root directory. Please cd to the project root."
    exit 1
fi

# Step 1: Commit changes
echo_step "Step 1: Committing recent changes"

git add .
git status

echo_info "Committing enhanced projects API with server diagnostics..."
git commit -m "[projects-api] Enhanced server diagnostics and permissions fix

- Added detailed file system permission checks
- Enhanced error logging for server debugging  
- Increased retry attempts from 3 to 5 with exponential backoff
- Added server environment diagnostics in error responses
- Created server-project-save-fix.sh diagnostic script
- Added atomic write operation testing
- Improved backup and restore logic

Fixes: POST /api/projects 500 error on server deployment"

echo_success "Changes committed"

# Step 2: Push to repository
echo_step "Step 2: Pushing to repository"

git push origin main
echo_success "Changes pushed to main branch"

# Step 3: Check server status (if server details are available)
echo_step "Step 3: Server deployment information"

echo_info "Server URL: https://redai.site"
echo_info "To deploy to server, run these commands on the server:"
echo ""
echo "# 1. Pull latest changes:"
echo "cd /path/to/redai && git pull origin main"
echo ""
echo "# 2. Install dependencies (if needed):"
echo "npm install"
echo ""
echo "# 3. Run diagnostic script:"
echo "./scripts/server-project-save-fix.sh"
echo ""
echo "# 4. Restart server:"
echo "pm2 restart redai || npm run build && npm start"
echo ""

# Step 4: Create server deployment instructions
echo_step "Step 4: Creating deployment instructions"

cat > /tmp/server-deploy-instructions.txt << 'EOF'
🔧 Red.Ai Projects Save Fix - Server Deployment Instructions

## Quick Fix Commands (run on server):

1. Navigate to project directory:
   cd /path/to/redai

2. Pull latest fixes:
   git pull origin main

3. Run diagnostic script:
   ./scripts/server-project-save-fix.sh

4. Check if fixes resolved issues:
   - The script will automatically fix file permissions
   - Check output for any remaining issues

5. Restart the application:
   # If using PM2:
   pm2 restart redai
   
   # If using Docker:
   docker-compose restart
   
   # If running directly:
   npm run build && npm start

## Manual Permission Fix (if needed):

If the automatic script doesn't work, manually fix permissions:

```bash
# Create database directory if it doesn't exist
mkdir -p database

# Fix directory permissions
chmod 755 database
chown $(whoami):$(id -gn) database

# Fix file permissions
chmod 644 database/projects.json
chown $(whoami):$(id -gn) database/projects.json

# Test write operation
echo "test" > database/.test && rm database/.test
```

## Verification:

1. Test API endpoint:
   curl -X POST "https://redai.site/api/projects" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Project","userId":"test","description":"Test"}'

2. Expected response:
   {"success":true,"project":{...}}

3. Check browser console when saving projects from the UI

## Enhanced Diagnostics:

The updated API now provides detailed error information including:
- File system permission details
- Server environment information
- Specific error codes and suggestions
- Retry attempt logs

## Contact:

If issues persist after running the fix:
1. Check server logs for detailed error information
2. Run the diagnostic script again
3. Consider switching to database storage (PostgreSQL/Supabase)

Generated: $(date)
EOF

echo_success "Created deployment instructions: /tmp/server-deploy-instructions.txt"
cat /tmp/server-deploy-instructions.txt

# Step 5: Test local API to ensure it works
echo_step "Step 5: Testing local API (if server is running)"

if curl -s http://localhost:3000/api/health &> /dev/null; then
    echo_success "Local server is running"
    
    # Test projects API
    echo_info "Testing projects API locally..."
    TEST_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/projects" \
        -H "Content-Type: application/json" \
        -d '{"name":"Deployment Test","userId":"deploy_test","description":"Testing deployment"}' \
        -w "HTTPSTATUS:%{http_code}")
    
    HTTP_BODY=$(echo "$TEST_RESPONSE" | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')
    HTTP_STATUS=$(echo "$TEST_RESPONSE" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo_success "Local API test successful"
        echo_info "Response: $HTTP_BODY"
    else
        echo_warning "Local API test failed with status: $HTTP_STATUS"
        echo_info "Response: $HTTP_BODY"
    fi
else
    echo_info "Local server not running (this is OK for deployment)"
fi

# Step 6: Summary
echo_step "Step 6: Deployment Summary"

echo "📋 What was deployed:"
echo "✅ Enhanced API with detailed server diagnostics"
echo "✅ Improved error handling and retry logic"
echo "✅ File system permission checking"
echo "✅ Server diagnostic script"
echo "✅ Atomic write operation improvements"
echo ""
echo "🎯 Expected fixes:"
echo "• Resolves 'Failed to save project after multiple attempts' error"
echo "• Provides detailed error information for debugging"
echo "• Automatically fixes common permission issues"
echo "• Improves reliability with exponential backoff retry"
echo ""
echo "🚀 Next steps:"
echo "1. SSH to server: ssh user@redai.site"
echo "2. Run: cd /path/to/redai && git pull && ./scripts/server-project-save-fix.sh"
echo "3. Restart: pm2 restart redai"
echo "4. Test: Try saving a project from the web interface"
echo ""

echo_success "Projects Save Fix deployment completed!"
echo_info "Server deployment instructions saved to: /tmp/server-deploy-instructions.txt"
echo_info "Copy this file to the server or reference the instructions above" 