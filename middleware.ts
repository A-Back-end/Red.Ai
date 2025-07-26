import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',           // Home page
  '/login(.*)',  // Login page and any sub-routes
  '/auth(.*)',   // Auth page and any sub-routes
  '/api/webhooks(.*)', // Webhook endpoints
  '/api/health(.*)', // Health check endpoints
  '/showcase',   // Showcase page
  '/image-generator', // Image generator page
  '/interior-design', // Interior design page
]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/project(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // For development, allow all routes without authentication
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }
  
  // Check if Clerk is properly configured
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = clerkPublishableKey && !clerkPublishableKey.includes('your_clerk_publishable_key_here');
  
  // If Clerk is not configured, allow all routes
  if (!isClerkConfigured) {
    return NextResponse.next();
  }
  
  // If it's a protected route and user is not authenticated, redirect to login
  if (isProtectedRoute(req)) {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    } catch (error) {
      console.error('Clerk authentication error:', error);
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  
  // Allow all other routes to proceed
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Exclude files with a "." followed by an extension, which are typically static files.
    // Exclude files in the _next directory, but allow authentication on _next/data routes.
    // Exclude folders like api/trpc which are handled separately
    '/((?!.*\\..*|_next|api/webhooks|api/health).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}; 