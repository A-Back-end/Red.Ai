#!/bin/bash

echo "🚀 Setting up Red.AI Database..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one based on env.example"
    exit 1
fi

# Install dependencies if not already installed
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate dev --name init

# Seed database with initial data (optional)
echo "🌱 Seeding database..."
npx prisma db seed

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up your Clerk webhook endpoint: https://your-domain.com/api/webhooks/clerk"
echo "2. Configure the webhook to listen for: user.created, user.updated, user.deleted"
echo "3. Add your CLERK_WEBHOOK_SECRET to your .env file"
echo ""
echo "To start the development server:"
echo "npm run dev" 