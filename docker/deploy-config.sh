#!/bin/bash

# Red.AI Docker Production Deployment Configuration
# Source this file before running docker-compose commands

echo "🔧 Loading Red.AI production configuration..."

# ==================== Clerk Authentication (Production) ====================
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_Y2xlcmsucmVkYWkuc2l0ZSQ"
export CLERK_SECRET_KEY="sk_live_XOBM4dWdsiCF86b4SxGiGMLajYcA2omHPe4Xcn6i9w"

# ==================== Core Configuration ====================
export NODE_ENV="production"
export NEXT_PUBLIC_APP_URL="https://redai.site"
export NEXT_PUBLIC_API_URL="https://redai.site/api"

# ==================== AI Services ====================
# Uncomment and set your actual keys:
# export OPENAI_API_KEY="your_openai_api_key_here"
# export AZURE_OPENAI_API_KEY="your_azure_openai_api_key_here"
# export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
# export AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4"
# export AZURE_OPENAI_API_VERSION="2024-05-01-preview"

# ==================== Other Services ====================
# export BFL_API_KEY="your_bfl_api_key_here"

echo "✅ Production configuration loaded!"
echo "   - Clerk Publishable Key: ${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}"
echo "   - Clerk Secret Key: [HIDDEN]"
echo "   - App URL: ${NEXT_PUBLIC_APP_URL}"
echo "   - API URL: ${NEXT_PUBLIC_API_URL}"
echo ""
echo "🚀 Now you can run: docker-compose -f ../docker-compose-redai-prod.yml up --build -d"
