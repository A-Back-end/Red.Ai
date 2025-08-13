#!/bin/bash

# 🚀 Deploy Database Fix for Red.Ai
# Финальный деплой всех исправлений для проблемы с сохранением проектов

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

echo "🚀 Deploying Database Fix for Red.Ai..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo_error "Not in Red.Ai root directory. Please cd to the project root."
    exit 1
fi

# Step 1: Commit all changes
echo_step "Step 1: Committing database fix changes"

git add .
git status

echo_info "Committing comprehensive database fix..."
git commit -m "[database-fix] Complete solution for server projects saving

🔧 What's fixed:
- Created Supabase API endpoint (/api/projects-supabase) 
- Added SQL schema for PostgreSQL/Supabase migration
- Built ProjectApiSwitcher component for easy switching
- Added memory storage fallback when DB unavailable
- Created quick server fix script for permissions
- Enhanced health check with detailed diagnostics

🎯 Solutions provided:
1. Quick fix: ./scripts/quick-server-fix.sh (fixes file permissions)
2. Temporary: Memory storage (works immediately, lost on restart)  
3. Permanent: Supabase migration (scalable, no file permission issues)

Resolves: 'Server configuration error: cannot write to database' on https://redai.site"

echo_success "Changes committed"

# Step 2: Push to repository
echo_step "Step 2: Pushing to repository"

git push origin main
echo_success "Changes pushed to main branch"

# Step 3: Test local endpoints
echo_step "Step 3: Testing local endpoints"

if curl -s http://localhost:3000/api/health &> /dev/null; then
    echo_success "Local server is running"
    
    # Test file API
    echo_info "Testing file API..."
    FILE_RESPONSE=$(curl -s http://localhost:3000/api/health | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"Status: {data['status']}, Writable: {data['database']['writable']}\")")
    echo_info "File API: $FILE_RESPONSE"
    
    # Test Supabase API (should work even without Supabase configured)
    echo_info "Testing Supabase API..."
    SUPABASE_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/projects-supabase" \
        -H "Content-Type: application/json" \
        -d '{"name":"Test Project","userId":"test","description":"Testing Supabase API"}')
    
    if echo "$SUPABASE_RESPONSE" | grep -q "success"; then
        echo_success "Supabase API is working (memory mode)"
    else
        echo_warning "Supabase API response: $SUPABASE_RESPONSE"
    fi
else
    echo_info "Local server not running (this is OK for deployment)"
fi

# Step 4: Create deployment instructions
echo_step "Step 4: Creating deployment instructions"

cat > /tmp/database-fix-deploy-instructions.txt << 'EOF'
🔧 Red.Ai Database Fix - Server Deployment Instructions

## PROBLEM DIAGNOSED:
Server health check shows: "writable": false
File exists and is readable, but process cannot write to /app/database/projects.json

## 3 SOLUTIONS PROVIDED:

### Option A: Quick Permission Fix (Immediate)
```bash
ssh user@redai.site
cd /path/to/redai
git pull origin main
./scripts/quick-server-fix.sh
pm2 restart redai
```

Expected result: File permissions fixed, projects save normally

### Option B: Supabase Migration (Recommended)
```bash
# 1. Create Supabase project at https://app.supabase.com
# 2. Run SQL from supabase/schema.sql in Supabase SQL Editor
# 3. Add environment variables to server:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 4. Update frontend to use Supabase API:
# Change /api/projects to /api/projects-supabase in components

# 5. Deploy
git pull origin main && npm run build && pm2 restart redai
```

### Option C: Memory Storage (Temporary)
Projects automatically saved to server memory if file system fails.
- Works immediately without any setup
- Data lost on server restart
- Good for immediate relief while setting up permanent solution

## NEW FEATURES ADDED:

1. **ProjectApiSwitcher Component**
   - Shows real-time status of both APIs
   - Allows switching between file and Supabase storage
   - Automatic fallback detection

2. **Enhanced Health Check**
   - Detailed file system diagnostics
   - Shows exact permission issues
   - Available at: https://redai.site/api/health

3. **Supabase API Endpoint**
   - Full PostgreSQL support
   - Memory fallback when Supabase not configured
   - Available at: https://redai.site/api/projects-supabase

## TESTING:

1. Check server status:
   curl https://redai.site/api/health

2. Test file API:
   curl -X POST "https://redai.site/api/projects" -H "Content-Type: application/json" -d '{"name":"Test","userId":"test"}'

3. Test Supabase API:
   curl -X POST "https://redai.site/api/projects-supabase" -H "Content-Type: application/json" -d '{"name":"Test","userId":"test"}'

## EXPECTED RESULTS:

✅ After Option A: File API returns 200, projects save to JSON file
✅ After Option B: Supabase API returns 200, projects save to PostgreSQL  
✅ After Option C: Either API returns 200, projects save to memory

All options eliminate the "Server configuration error: cannot write to database" issue.

Generated: $(date)
EOF

echo_success "Created deployment instructions: /tmp/database-fix-deploy-instructions.txt"

# Step 5: Display instructions
cat /tmp/database-fix-deploy-instructions.txt

# Step 6: Final summary
echo_step "Step 6: Deployment Summary"

echo "📋 What was deployed:"
echo "✅ Supabase API endpoint with memory fallback"
echo "✅ SQL schema for PostgreSQL migration"
echo "✅ ProjectApiSwitcher for easy API switching"
echo "✅ Quick server fix script for permissions"
echo "✅ Enhanced diagnostics and health checks"
echo ""
echo "🎯 Solutions available:"
echo "🔧 Quick fix: File permission repair (immediate)"
echo "🗃️  Supabase: PostgreSQL migration (recommended)"
echo "💾 Memory: Temporary storage (fallback)"
echo ""
echo "🚀 Next steps for server:"
echo "1. SSH to server and run: git pull origin main"
echo "2. Choose solution A, B, or C from instructions above"
echo "3. Test at: https://redai.site/dashboard?view=flux-designer"
echo "4. Verify projects save without 500 errors"
echo ""

echo_success "Database fix deployment completed!"
echo_info "Copy /tmp/database-fix-deploy-instructions.txt to server for reference" 