'use client';

import { AuthenticateWithRedirectCallback, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SSOCallbackPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      // Отслеживаем успешный вход через OAuth
      const trackOAuthSignIn = async () => {
        try {
          const { clerkAnalytics } = await import('@/lib/clerk-analytics');
          await clerkAnalytics.trackEvent({
            event: 'oauth_sign_in_success',
            userId: user.id,
            userEmail: user.emailAddresses[0]?.emailAddress,
            userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
            properties: {
              provider: user.externalAccounts[0]?.provider || 'unknown',
              signInMethod: 'oauth',
              timestamp: new Date().toISOString(),
            },
          });
        } catch (analyticsError) {
          console.warn('Failed to track OAuth sign-in analytics:', analyticsError);
        }
      };

      trackOAuthSignIn();
    }
  }, [isLoaded, user]);

  return <AuthenticateWithRedirectCallback />;
} 