#!/bin/bash

# Red.AI Production Deployment Script
# This script deploys the application with production Clerk keys

set -e

echo "🚀 Starting Red.AI Production Deployment..."

# Set production environment variables
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_Y2xlcmsucmVkYWkuc2l0ZSQ"
export CLERK_SECRET_KEY="sk_live_XOBM4dWdsiCF86b4SxGiGMLajYcA2omHPe4Xcn6i9w"
export NODE_ENV="production"

echo "✅ Environment variables set:"
echo "   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}"
echo "   - CLERK_SECRET_KEY: [HIDDEN]"
echo "   - NODE_ENV: ${NODE_ENV}"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose-redai-prod.yml down

# Remove old images to force rebuild
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start with production configuration
echo "🔨 Building and starting production containers..."
docker-compose -f docker-compose-redai-prod.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
docker-compose -f docker-compose-redai-prod.yml ps

echo "✅ Production deployment completed!"
echo "🌐 Your app should be available at: https://redai.site"
echo "📊 Check logs with: docker-compose -f docker-compose-redai-prod.yml logs -f"
