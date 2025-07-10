import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',           // Home page
  '/login(.*)',  // Login page and any sub-routes
  '/auth(.*)',   // Auth page and any sub-routes
  '/api/webhooks(.*)', // Webhook endpoints
  '/api/health(.*)', // Health check endpoints
]);

export default clerkMiddleware();

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