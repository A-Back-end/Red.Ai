'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface ClerkDebugProps {
  showDebug?: boolean;
}

export default function ClerkDebugInfo({ showDebug = false }: ClerkDebugProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [envInfo, setEnvInfo] = useState<any>({});

  useEffect(() => {
    // Get client-side environment variables
    const clientEnv = {
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      nodeEnv: process.env.NODE_ENV,
      captchaDisabled: process.env.NEXT_PUBLIC_CLERK_DISABLE_CAPTCHA,
    };
    setEnvInfo(clientEnv);
  }, []);

  if (!showDebug) return null;

  const getKeyType = (key: string | undefined) => {
    if (!key) return 'Not Set';
    if (key.startsWith('pk_test_')) return 'TEST (Development)';
    if (key.startsWith('pk_live_')) return 'LIVE (Production)';
    return 'Unknown';
  };

  const getKeyColor = (key: string | undefined) => {
    if (!key) return 'text-red-500';
    if (key.startsWith('pk_test_')) return 'text-green-500';
    if (key.startsWith('pk_live_')) return 'text-orange-500';
    return 'text-gray-500';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md z-50 font-mono">
      <div className="mb-2 font-bold text-blue-400">🔍 Clerk Debug Info</div>
      
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">Publishable Key:</span>
          <div className={`ml-2 ${getKeyColor(envInfo.publishableKey)}`}>
            {getKeyType(envInfo.publishableKey)}
          </div>
          <div className="text-gray-500 text-xs ml-2">
            {envInfo.publishableKey?.substring(0, 20)}...
          </div>
        </div>

        <div>
          <span className="text-gray-400">App URL:</span>
          <span className="ml-2 text-cyan-400">{envInfo.appUrl || 'Not Set'}</span>
        </div>

        <div>
          <span className="text-gray-400">Node ENV:</span>
          <span className="ml-2 text-yellow-400">{envInfo.nodeEnv || 'Not Set'}</span>
        </div>

        <div>
          <span className="text-gray-400">Captcha Disabled:</span>
          <span className="ml-2 text-green-400">{envInfo.captchaDisabled || 'false'}</span>
        </div>

        <hr className="border-gray-600 my-2" />

        <div>
          <span className="text-gray-400">Clerk Status:</span>
          <div className="ml-2">
            {!isLoaded && <span className="text-yellow-400">Loading...</span>}
            {isLoaded && isSignedIn && <span className="text-green-400">Signed In</span>}
            {isLoaded && !isSignedIn && <span className="text-orange-400">Not Signed In</span>}
          </div>
        </div>

        {isLoaded && isSignedIn && user && (
          <div>
            <span className="text-gray-400">User:</span>
            <div className="ml-2 text-green-400">
              {user.emailAddresses[0]?.emailAddress || user.username || 'Unknown'}
            </div>
          </div>
        )}

        <hr className="border-gray-600 my-2" />

        <div className="text-xs">
          {envInfo.publishableKey?.startsWith('pk_test_') ? (
            <div className="text-green-400">✅ Using TEST keys - works with localhost</div>
          ) : envInfo.publishableKey?.startsWith('pk_live_') ? (
            <div className="text-red-400">❌ Using LIVE keys - only works with redai.site</div>
          ) : (
            <div className="text-red-400">❌ Clerk keys not configured</div>
          )}
        </div>
      </div>
    </div>
  );
} 