#!/bin/bash

# Red.AI Server Docker Fix Script
# Исправляет проблемы с нехваткой места и Docker

set -e

echo "🔧 Red.AI Server Docker Fix Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check disk space
print_status "Checking disk space..."
df -h /

# Check Docker status
print_status "Checking Docker status..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi

if ! docker info &> /dev/null; then
    print_error "Docker is not running"
    print_status "Starting Docker..."
    sudo systemctl start docker
    sleep 5
fi

# Stop all running containers
print_status "Stopping all running containers..."
docker stop $(docker ps -q) 2>/dev/null || print_warning "No running containers to stop"

# Remove all containers
print_status "Removing all containers..."
docker rm $(docker ps -aq) 2>/dev/null || print_warning "No containers to remove"

# Remove all images
print_status "Removing all Docker images..."
docker rmi $(docker images -q) 2>/dev/null || print_warning "No images to remove"

# Remove all volumes
print_status "Removing all Docker volumes..."
docker volume rm $(docker volume ls -q) 2>/dev/null || print_warning "No volumes to remove"

# Remove all networks
print_status "Removing all Docker networks..."
docker network rm $(docker network ls -q) 2>/dev/null || print_warning "No networks to remove"

# Clean up Docker system
print_status "Cleaning up Docker system..."
docker system prune -af --volumes

# Clean up build cache
print_status "Cleaning up build cache..."
docker builder prune -af

# Check Docker disk usage after cleanup
print_status "Docker disk usage after cleanup:"
docker system df

# Check disk space after cleanup
print_status "Disk space after cleanup:"
df -h /

# Create optimized .dockerignore if it doesn't exist
if [ ! -f .dockerignore ]; then
    print_status "Creating .dockerignore file..."
    cat > .dockerignore << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
pip-log.txt
pip-delete-this-directory.txt

# Build outputs
.next/
out/
build/
dist/
*.egg-info/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Git
.git/
.gitignore

# Docker
Dockerfile*
docker-compose*
.dockerignore

# Documentation
README.md
docs/
*.md

# Test files
tests/
test/
__tests__/
*.test.js
*.test.ts
*.spec.js
*.spec.ts

# Backup files
*.backup
*.bak
EOF
    print_success "Created .dockerignore file"
fi

# Create optimized docker-compose for server
print_status "Creating optimized docker-compose for server..."
cat > docker-compose-server.yml << 'EOF'
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend.optimized
    container_name: redai_backend_server
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DEBUG=false
      - AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY:-your_azure_key_here}
      - AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT:-https://neuroflow-hub.openai.azure.com}
      - AZURE_OPENAI_API_VERSION=${AZURE_OPENAI_API_VERSION:-2024-05-01-preview}
      - AZURE_OPENAI_DEPLOYMENT_NAME=${AZURE_OPENAI_DEPLOYMENT_NAME:-gpt-4.1}
    restart: unless-stopped
    networks:
      - redai-network
    volumes:
      - uploads_data:/app/uploads
      - logs_data:/app/logs
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
        reservations:
          memory: 512M
          cpus: '0.25'

  ai-processor:
    build:
      context: .
      dockerfile: docker/Dockerfile.ai-processor.optimized
    container_name: redai_ai_processor_server
    ports:
      - "8001:8001"
    environment:
      - NODE_ENV=production
      - AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY:-your_azure_key_here}
      - AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT:-https://neuroflow-hub.openai.azure.com}
      - AZURE_OPENAI_API_VERSION=${AZURE_OPENAI_API_VERSION:-2024-05-01-preview}
      - AZURE_OPENAI_DEPLOYMENT_NAME=${AZURE_OPENAI_DEPLOYMENT_NAME:-gpt-4.1}
    restart: unless-stopped
    networks:
      - redai-network
    volumes:
      - uploads_data:/app/uploads
    depends_on:
      - backend
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'

  postgres:
    image: postgres:15-alpine
    container_name: redai_postgres_server
    environment:
      - POSTGRES_DB=redai
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - redai-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.25'

  redis:
    image: redis:7-alpine
    container_name: redai_redis_server
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - redai-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.1'

networks:
  redai-network:
    driver: bridge

volumes:
  uploads_data:
    driver: local
  logs_data:
    driver: local
  postgres_data:
    driver: local
EOF

print_success "Created optimized docker-compose-server.yml"

# Create environment file template
if [ ! -f .env ]; then
    print_status "Creating .env template..."
    cat > .env << 'EOF'
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://neuroflow-hub.openai.azure.com
AZURE_OPENAI_API_VERSION=2024-05-01-preview
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4.1

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/redai
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your_secret_key_here
JWT_SECRET=your_jwt_secret_here
EOF
    print_success "Created .env template"
    print_warning "Please update .env file with your actual Azure OpenAI API key"
fi

print_success "Server Docker fix completed!"
print_status "Next steps:"
echo "1. Update .env file with your Azure OpenAI API key"
echo "2. Run: docker-compose -f docker-compose-server.yml up -d --build"
echo "3. Check logs: docker-compose -f docker-compose-server.yml logs -f" 