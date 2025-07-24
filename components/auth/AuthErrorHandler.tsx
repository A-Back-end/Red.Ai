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