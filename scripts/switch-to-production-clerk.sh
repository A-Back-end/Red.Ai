#!/bin/bash

# Script to switch Clerk from development to production mode
# Скрипт для переключения Clerk с development на production режим

set -e

echo "🔧 Switching Clerk to Production Mode..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 exists${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 not found${NC}"
        return 1
    fi
}

# Function to check Clerk keys
check_clerk_keys() {
    local env_file="$1"
    echo -e "\n${BLUE}Checking Clerk keys in $env_file:${NC}"
    
    if [ -f "$env_file" ]; then
        # Check publishable key
        local pub_key=$(grep "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "$env_file" | cut -d'=' -f2)
        if [[ "$pub_key" == *"pk_test_"* ]]; then
            echo -e "${RED}❌ Development key detected: $pub_key${NC}"
            return 1
        elif [[ "$pub_key" == *"pk_live_"* ]]; then
            echo -e "${GREEN}✅ Production key detected: $pub_key${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Placeholder key detected: $pub_key${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ File $env_file not found${NC}"
        return 1
    fi
}

# Check current environment
echo -e "\n${BLUE}Current Environment Check:${NC}"
echo "NODE_ENV: ${NODE_ENV:-not set}"

# Check .env files
echo -e "\n${BLUE}Checking .env files:${NC}"
check_file ".env"
check_file ".env.production"

# Check Clerk keys in .env
echo -e "\n${BLUE}Checking Clerk Configuration:${NC}"
check_clerk_keys ".env"
check_clerk_keys ".env.production"

# Instructions for production setup
echo -e "\n${YELLOW}📋 Instructions to get production Clerk keys:${NC}"
echo "1. Go to https://dashboard.clerk.com"
echo "2. Select your application"
echo "3. Go to 'API Keys' in the sidebar"
echo "4. Copy the 'Publishable key' (starts with pk_live_)"
echo "5. Copy the 'Secret key' (starts with sk_live_)"
echo "6. Go to 'Webhooks' and create a webhook with URL: https://redai.site/api/webhooks/clerk"
echo "7. Copy the webhook secret (starts with whsec_)"

# Create production .env template
echo -e "\n${BLUE}Creating production .env template...${NC}"
cat > .env.production.template << 'EOF'
# RED AI - Production Environment Variables
# Copy this file to .env.production and fill in your actual values

NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://redai.site

# Clerk Production Keys (REPLACE WITH YOUR ACTUAL KEYS)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_CLERK_PUBLISHABLE_KEY_HERE
CLERK_SECRET_KEY=sk_live_YOUR_PRODUCTION_CLERK_SECRET_KEY_HERE
CLERK_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET_HERE

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# BFL API Configuration
BFL_API_KEY=your_bfl_api_key_here

# Other production configurations...
EOF

echo -e "${GREEN}✅ Production template created: .env.production.template${NC}"

# Check if production keys are set
echo -e "\n${BLUE}Checking if production keys are configured:${NC}"
if [ -f ".env.production" ]; then
    if grep -q "pk_live_" .env.production; then
        echo -e "${GREEN}✅ Production Clerk keys found in .env.production${NC}"
    else
        echo -e "${YELLOW}⚠️  Production keys not found in .env.production${NC}"
        echo -e "${BLUE}Please update .env.production with your production keys${NC}"
    fi
fi

# Test the configuration
echo -e "\n${BLUE}Testing Clerk configuration...${NC}"
if command -v node &> /dev/null; then
    node -e "
        const fs = require('fs');
        const path = require('path');
        
        // Load .env.production if exists
        if (fs.existsSync('.env.production')) {
            require('dotenv').config({ path: '.env.production' });
        }
        
        const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
        if (clerkKey && clerkKey.includes('pk_live_')) {
            console.log('✅ Production Clerk key detected');
        } else if (clerkKey && clerkKey.includes('pk_test_')) {
            console.log('❌ Development Clerk key detected');
        } else {
            console.log('⚠️  Clerk key not properly configured');
        }
    " 2>/dev/null || echo -e "${YELLOW}⚠️  Node.js not available for testing${NC}"
else
    echo -e "${YELLOW}⚠️  Node.js not available for testing${NC}"
fi

echo -e "\n${GREEN}🎉 Clerk production setup complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update .env.production with your actual production keys"
echo "2. Test the application with: npm run build"
echo "3. Deploy to production server" 