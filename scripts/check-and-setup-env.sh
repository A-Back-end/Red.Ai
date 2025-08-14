#!/bin/bash

# Red.AI Environment Check and Setup Script
# Проверяет и настраивает переменные окружения для запуска

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

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from example..."
    if [ -f env.production.example ]; then
        cp env.production.example .env
        print_success "Created .env from env.production.example"
    else
        print_error "env.production.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Load environment variables
print_status "Loading environment variables..."
source .env

# Check required variables
print_status "Checking required environment variables..."

# Check Clerk Publishable Key
if [ -z "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
    print_error "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set"
    print_status "Please set this variable in your .env file"
    print_status "You can get it from: https://dashboard.clerk.com/last-active?path=api-keys"
    exit 1
fi

if [[ "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" == *"YOUR_CLERK_PUBLISHABLE_KEY_HERE"* ]] || \
   [[ "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" == *"placeholder"* ]]; then
    print_error "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY contains placeholder value"
    print_status "Please set a real Clerk API key in your .env file"
    exit 1
fi

print_success "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set: ${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:0:20}..."

# Check other important variables
if [ -z "$OPENAI_API_KEY" ]; then
    print_warning "OPENAI_API_KEY is not set (optional for basic functionality)"
fi

if [ -z "$AZURE_OPENAI_API_KEY" ]; then
    print_warning "AZURE_OPENAI_API_KEY is not set (optional for Azure AI features)"
fi

if [ -z "$BFL_API_KEY" ]; then
    print_warning "BFL_API_KEY is not set (optional for BFL features)"
fi

# Export variables for Docker
print_status "Exporting environment variables for Docker..."
export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
export OPENAI_API_KEY
export AZURE_OPENAI_API_KEY
export BFL_API_KEY

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed or not in PATH"
    exit 1
fi

print_success "Environment check completed successfully!"
print_status "You can now run: docker-compose up --build"
