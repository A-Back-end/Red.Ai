#!/bin/bash

# Fix Clerk Configuration for Localhost Development
# This script creates proper .env files for local development

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

echo_step "🔧 Fixing Clerk Configuration for Localhost Development"

# Create .env file for development
echo_step "Creating .env file for development..."

cat > .env << 'EOF'
# Development Environment Variables for Red.AI
# Local development configuration

# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000

# Clerk Authentication (Development Keys - работают с localhost)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bGVhcm5pbmctamVubmV0LTgzLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_Q4dXsL37jneHgKUCm87G9B80YPPqoZjNyAoqU5kTEu
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# BFL API Key for image generation
BFL_API_KEY=501cf430-f9d9-445b-9b60-1949650f352a

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=FM1DHQMuPkCX1TKRnIVVprIoQ1RwI6yaPBNEJ0gx3kdRUNMpprAlJQQJ99BGACYeBjFXJ3w3AAABACOGLuJD
AZURE_OPENAI_ENDPOINT=https://neuroflow-hub.openai.azure.com
AZURE_OPENAI_API_VERSION=2024-05-01-preview
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4.1
AZURE_ENDPOINT_KEY=https://neuroflow-hub.openai.azure.com/
USE_AZURE_AD=false

# Database Configuration (для локальной разработки)
DATABASE_URL=postgresql://postgres:password@localhost:5432/redai
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=development_secret_key_here
JWT_SECRET=development_jwt_secret_here

# CORS Configuration для localhost
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
DALLE_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Development flags
NEXT_PUBLIC_CLERK_DISABLE_CAPTCHA=true
CLERK_DISABLE_CAPTCHA=true

# Monitoring
PROMETHEUS_PORT=9090
EOF

echo_success ".env file created successfully"

# Create .env.local file (has priority over .env in Next.js)
echo_step "Creating .env.local file..."

cat > .env.local << 'EOF'
# Local Development Overrides
# Этот файл имеет приоритет над .env для Next.js

# Clerk для localhost development (TEST KEYS)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bGVhcm5pbmctamVubmV0LTgzLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_Q4dXsL37jneHgKUCm87G9B80YPPqoZjNyAoqU5kTEu

# App URLs для localhost
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000

# Development mode
NODE_ENV=development

# Disable Clerk captcha for easier development
NEXT_PUBLIC_CLERK_DISABLE_CAPTCHA=true
EOF

echo_success ".env.local file created successfully"

# Verify the configuration
echo_step "Verifying configuration..."

if grep -q "pk_test_" .env.local; then
    echo_success "✅ Using development Clerk keys (pk_test_)"
else
    echo_error "❌ Clerk keys not properly configured"
fi

if grep -q "localhost:3000" .env.local; then
    echo_success "✅ App URL configured for localhost"
else
    echo_error "❌ App URL not properly configured"
fi

echo_step "🎉 Configuration Fixed!"
echo_info "Теперь перезапустите сервер разработки:"
echo_info "npm run dev"
echo ""
echo_warning "📝 Важно:"
echo_warning "- Используются тестовые ключи Clerk (pk_test_) для localhost"
echo_warning "- Для production используйте другие ключи в env.production.local"
echo_warning "- Файлы .env* добавлены в .gitignore и не будут коммититься"

echo ""
echo_success "🚀 Red.AI готов к разработке на localhost!" 