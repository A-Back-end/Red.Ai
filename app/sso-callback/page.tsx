import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

// Force dynamic rendering for Clerk authentication
export const dynamic = 'force-dynamic';
 
export default function SSOCallbackPage() {
  return <AuthenticateWithRedirectCallback />;
} 