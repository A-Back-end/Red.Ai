#!/bin/bash

# Red.AI Environment Creation Script
# Создает .env файл с правильными значениями

set -e

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

# Check if .env already exists
if [ -f .env ]; then
    print_warning ".env file already exists. Creating backup..."
    cp .env .env.backup.$(date +%s)
    print_success "Backup created: .env.backup.$(date +%s)"
fi

# Create .env file
print_status "Creating .env file with production values..."

cat > .env << 'EOF'
# RED AI - Production Environment Variables

# ==================== Core Configuration ====================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://redai.site

# ==================== Authentication (Clerk) ====================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsucmVkYWkuc2l0ZSQ
CLERK_SECRET_KEY=sk_live_XOBM4dWdsiCF86b4SxGiGMLajYcA2omHPe4Xcn6i9w

# ==================== Azure OpenAI Configuration ====================
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# ==================== Azure DALL-E Configuration ====================
AZURE_DALLE_API_KEY=your_azure_dalle_api_key_here
AZURE_DALLE_ENDPOINT=https://your-dalle-resource.openai.azure.com/
AZURE_DALLE_DEPLOYMENT_NAME=dall-e-3
AZURE_DALLE_API_VERSION=2024-02-15-preview

# ==================== CORS Configuration ====================
ALLOWED_ORIGINS=https://redai.site
DALLE_ALLOWED_ORIGINS=https://redai.site

# ==================== Database Configuration ====================
POSTGRES_DB=redai_db
POSTGRES_USER=redai_user
POSTGRES_PASSWORD=redai_password
DATABASE_URL=postgresql://redai_user:redai_password@postgres:5432/redai_db

# ==================== Redis Configuration ====================
REDIS_URL=redis://redis:6379

# ==================== Storage Configuration ====================
STORAGE_BUCKET=redai-production-storage
STORAGE_PATH=uploads/

# ==================== API Configuration ====================
API_BASE_URL=https://redai.site/api
SECRET_KEY=your_very_secure_secret_key_for_production

# ==================== Security ====================
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# ==================== Monitoring & Logging ====================
LOG_LEVEL=INFO
ENABLE_ANALYTICS=true

# ==================== Rate Limiting ====================
RATE_LIMIT_REQUESTS_PER_MINUTE=100

# ==================== AWS S3 Configuration (Required for Production) ====================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_S3_BUCKET_NAME=your-s3-bucket-name

# ==================== Alternative Storage Options ====================
# Uncomment if you prefer Google Cloud Storage:
# GCS_PROJECT_ID=your-gcs-project-id
# GCS_BUCKET_NAME=your-gcs-bucket-name
# GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json

# Uncomment if you prefer Azure Blob Storage:
# AZURE_STORAGE_ACCOUNT_NAME=your_storage_account
# AZURE_STORAGE_ACCESS_KEY=your_storage_access_key
# AZURE_STORAGE_CONTAINER_NAME=generated-images
EOF

print_success ".env file created successfully!"

# Make it executable
chmod +x .env

print_status "Next steps:"
print_status "1. Review and update the .env file with your actual API keys"
print_status "2. Run: ./scripts/check-and-setup-env.sh"
print_status "3. Run: ./scripts/start-production.sh"
