#!/bin/bash

# Quick Fix for Clerk Deployment Issue
# This script fixes the NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY error

set -e

echo "🔧 Fixing Clerk deployment issue..."

# Set the correct production Clerk keys
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_Y2xlcmsucmVkYWkuc2l0ZSQ"
export CLERK_SECRET_KEY="sk_live_XOBM4dWdsiCF86b4SxGiGMLajYcA2omHPe4Xcn6i9w"

echo "✅ Clerk keys set:"
echo "   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}"
echo "   - CLERK_SECRET_KEY: [HIDDEN]"

# Stop any running containers
echo "🛑 Stopping containers..."
docker-compose -f docker-compose-redai-prod.yml down 2>/dev/null || true

# Clean up Docker cache
echo "🧹 Cleaning Docker cache..."
docker system prune -f

# Build and start with fixed configuration
echo "🔨 Building with fixed Clerk configuration..."
docker-compose -f docker-compose-redai-prod.yml up --build -d

echo "✅ Fix applied! Your app should now build successfully."
echo "📊 Monitor logs: docker-compose -f docker-compose-redai-prod.yml logs -f frontend"
