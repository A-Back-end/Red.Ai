#!/bin/bash

# Auto Fix Clerk Authentication Issues
# This script automatically fixes all Clerk authentication problems

set -e

echo "🚀 Auto Fixing Clerk Authentication Issues..."

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

# Step 1: Check and install dependencies
echo_step "Step 1: Checking dependencies..."

if ! npm list svix > /dev/null 2>&1; then
    echo_info "Installing svix package..."
    npm install svix
    echo_success "svix package installed"
else
    echo_success "svix package already installed"
fi

# Step 2: Check environment variables
echo_step "Step 2: Checking environment variables..."

if [ ! -f ".env" ]; then
    echo_error ".env file not found"
    exit 1
fi

# Check if CLERK_WEBHOOK_SECRET is missing
if ! grep -q "CLERK_WEBHOOK_SECRET" .env; then
    echo_warning "CLERK_WEBHOOK_SECRET not found in .env"
    echo_info "Please add the following line to your .env file:"
    echo "CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here"
    echo ""
    echo_info "To get your webhook secret:"
    echo "1. Go to https://dashboard.clerk.com"
    echo "2. Select your application"
    echo "3. Go to Webhooks"
    echo "4. Create a new webhook with URL: https://redai.site/api/webhooks/clerk"
    echo "5. Copy the webhook secret"
    echo ""
    read -p "Press Enter after you've added the webhook secret to .env..."
fi

# Step 3: Clear Next.js cache
echo_step "Step 3: Clearing Next.js cache..."

if [ -d ".next" ]; then
    rm -rf .next
    echo_success "Next.js cache cleared"
else
    echo_info "No Next.js cache found"
fi

# Step 4: Check if webhook handler exists
echo_step "Step 4: Checking webhook handler..."

if [ ! -f "app/api/webhooks/clerk/route.ts" ]; then
    echo_error "Webhook handler not found"
    echo_info "Creating webhook handler..."
    
    # Create directory if it doesn't exist
    mkdir -p app/api/webhooks/clerk
    
    # Create webhook handler
    cat > app/api/webhooks/clerk/route.ts << 'EOF'
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  console.log('Webhook body:', body);

  // Handle the webhook
  switch (eventType) {
    case 'user.created':
      console.log('User created:', evt.data);
      break;
    case 'user.updated':
      console.log('User updated:', evt.data);
      break;
    case 'user.deleted':
      console.log('User deleted:', evt.data);
      break;
    case 'session.created':
      console.log('Session created:', evt.data);
      break;
    case 'session.ended':
      console.log('Session ended:', evt.data);
      break;
    default:
      console.log('Unhandled event type:', eventType);
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
EOF
    echo_success "Webhook handler created"
else
    echo_success "Webhook handler already exists"
fi

# Step 5: Check if AuthErrorHandler exists
echo_step "Step 5: Checking AuthErrorHandler..."

if [ ! -f "components/auth/AuthErrorHandler.tsx" ]; then
    echo_error "AuthErrorHandler not found"
    echo_info "Creating AuthErrorHandler..."
    
    # Create directory if it doesn't exist
    mkdir -p components/auth
    
    # Create AuthErrorHandler
    cat > components/auth/AuthErrorHandler.tsx << 'EOF'
'use client';

import React, { useEffect, useState } from 'react';
import { useClerk, useUser } from '@clerk/nextjs';

interface AuthErrorHandlerProps {
  children: React.ReactNode;
}

export const AuthErrorHandler: React.FC<AuthErrorHandlerProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Listen for authentication errors
    const handleAuthError = (event: MessageEvent) => {
      if (event.data && event.data.type === 'clerk-error') {
        console.error('Clerk authentication error:', event.data.error);
        setHasError(true);
        setErrorMessage(event.data.error.message || 'Authentication error occurred');
      }
    };

    // Listen for network errors
    const handleNetworkError = () => {
      console.error('Network error detected');
      setHasError(true);
      setErrorMessage('Network connection error. Please check your internet connection.');
    };

    // Add event listeners
    window.addEventListener('message', handleAuthError);
    window.addEventListener('online', () => setHasError(false));
    window.addEventListener('offline', handleNetworkError);

    // Check for existing errors in console
    const originalError = console.error;
    console.error = (...args) => {
      const errorString = args.join(' ');
      if (errorString.includes('clerk') || errorString.includes('authentication')) {
        setHasError(true);
        setErrorMessage('Authentication service error detected');
      }
      originalError.apply(console, args);
    };

    return () => {
      window.removeEventListener('message', handleAuthError);
      window.removeEventListener('online', () => setHasError(false));
      window.removeEventListener('offline', handleNetworkError);
      console.error = originalError;
    };
  }, []);

  const handleRetry = async () => {
    try {
      setHasError(false);
      setErrorMessage('');
      
      // Force reload the page to retry authentication
      window.location.reload();
    } catch (error) {
      console.error('Error during retry:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setHasError(false);
      setErrorMessage('');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-500">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Authentication Error
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {errorMessage}
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleRetry}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Retry Authentication
            </button>
            
            <button
              onClick={handleSignOut}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Sign Out
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              If the problem persists, please contact support
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthErrorHandler;
EOF
    echo_success "AuthErrorHandler created"
else
    echo_success "AuthErrorHandler already exists"
fi

# Step 6: Run final diagnostics
echo_step "Step 6: Running final diagnostics..."

./scripts/fix-clerk-config.sh

# Step 7: Instructions for manual steps
echo_step "Step 7: Manual steps required"

echo_info "To complete the fix, you need to:"
echo ""
echo "1. Add CLERK_WEBHOOK_SECRET to your .env file"
echo "2. Configure webhook in Clerk Dashboard:"
echo "   - URL: https://redai.site/api/webhooks/clerk"
echo "   - Events: user.created, user.updated, session.created, session.ended"
echo "3. Restart your development server:"
echo "   npm run dev"
echo "4. Clear browser cache and cookies"
echo "5. Test authentication"

echo_success "Auto-fix completed! Please follow the manual steps above." 