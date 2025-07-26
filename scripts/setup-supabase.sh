#!/bin/bash

# 🚀 Red.Ai Supabase Setup Script
# Быстрая настройка Supabase для проекта Red.Ai

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

echo "🚀 Setting up Supabase for Red.Ai..."

# Step 1: Check if npm install is complete
echo_step "Step 1: Checking dependencies"

if npm list @supabase/supabase-js &> /dev/null; then
    echo_success "Supabase client is installed"
else
    echo_info "Installing Supabase client..."
    npm install @supabase/supabase-js
    echo_success "Supabase client installed"
fi

# Step 2: Create environment variables template
echo_step "Step 2: Creating environment template"

cat > .env.supabase.example << 'EOF'
# Supabase Configuration
# Get these values from your Supabase project dashboard: https://app.supabase.com

# Project URL (found in Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Anon key (found in Project Settings > API)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service role key (found in Project Settings > API) - KEEP SECRET!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF

echo_success "Created .env.supabase.example"

# Step 3: Check current .env file
echo_step "Step 3: Checking current .env configuration"

if [ -f ".env" ]; then
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env; then
        echo_success "Supabase variables found in .env"
        
        SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env | cut -d'=' -f2)
        if [[ "$SUPABASE_URL" == *"supabase.co"* ]]; then
            echo_success "Valid Supabase URL configured"
        else
            echo_warning "Supabase URL needs configuration"
        fi
    else
        echo_warning "Supabase variables not found in .env"
        echo_info "Add the following to your .env file:"
        echo ""
        cat .env.supabase.example
    fi
else
    echo_warning ".env file not found"
    echo_info "Create .env file with Supabase configuration"
fi

# Step 4: Test connection
echo_step "Step 4: Testing Supabase connection"

if [ -f ".env" ] && grep -q "NEXT_PUBLIC_SUPABASE_URL" .env; then
    # Try to test the new endpoint
    if curl -s http://localhost:3000/api/projects-supabase?userId=test &> /dev/null; then
        echo_success "Supabase API endpoint is accessible"
    else
        echo_info "Start the server to test Supabase connection: npm run dev"
    fi
else
    echo_info "Configure Supabase variables first"
fi

# Step 5: Migration instructions
echo_step "Step 5: Database Migration"

echo "📋 To complete Supabase setup:"
echo ""
echo "1. Create Supabase project:"
echo "   • Go to https://app.supabase.com"
echo "   • Create new project"
echo "   • Wait for database to initialize"
echo ""
echo "2. Run SQL schema:"
echo "   • Open SQL Editor in Supabase dashboard"
echo "   • Copy content from supabase/schema.sql"
echo "   • Execute the SQL"
echo ""
echo "3. Configure environment:"
echo "   • Copy API keys from Project Settings > API"
echo "   • Add to .env file (see .env.supabase.example)"
echo ""
echo "4. Switch to Supabase API:"
echo "   • Update frontend to use /api/projects-supabase instead of /api/projects"
echo "   • Deploy to server"
echo ""

# Step 6: Show migration script
echo_step "Step 6: Data Migration (if needed)"

echo "📤 To migrate existing projects to Supabase:"
echo ""
echo "1. Export existing data:"
echo "   curl 'https://redai.site/api/projects?userId=all' > projects_backup.json"
echo ""
echo "2. Import to Supabase (after setup):"
echo "   node scripts/migrate-to-supabase.js projects_backup.json"
echo ""

# Step 7: Quick fix for immediate relief
echo_step "Step 7: Immediate Fix Options"

echo "🔧 Quick solutions while setting up Supabase:"
echo ""
echo "A) Use memory storage (temporary):"
echo "   • Projects will be saved to server memory"
echo "   • Lost on server restart"
echo "   • Good for immediate testing"
echo ""
echo "B) Fix file permissions (on server):"
echo "   ssh user@redai.site"
echo "   cd /path/to/redai"
echo "   sudo chown -R \$(whoami) database/"
echo "   sudo chmod 755 database/"
echo "   sudo chmod 644 database/projects.json"
echo ""
echo "C) Switch to Supabase (recommended):"
echo "   • Permanent solution"
echo "   • Scalable and reliable"
echo "   • No file permission issues"
echo ""

echo_success "Supabase setup guide completed!"
echo_info "Choose option A, B, or C based on your needs"
echo ""
echo "📞 Need help? Check the documentation:"
echo "   • Supabase docs: https://supabase.com/docs"
echo "   • Red.Ai docs: docs/SERVER_PROJECTS_SAVE_FIX.md" 