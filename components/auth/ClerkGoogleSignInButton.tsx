/**
 * Clerk Google Sign-In Button Component
 * Компонент кнопки входа через Google с использованием Clerk
 */

'use client'

import React, { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

interface ClerkGoogleSignInButtonProps {
  theme: 'light' | 'dark'
  language: 'en' | 'ru'
  onSuccess?: (userData: any) => void
  onError?: (error: string) => void
  className?: string
}

export const ClerkGoogleSignInButton: React.FC<ClerkGoogleSignInButtonProps> = ({ 
  theme, 
  language, 
  onSuccess,
  onError,
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useSignIn()
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    if (!signIn) return
    
    setIsLoading(true)
    
    try {
      // Start the Google OAuth flow
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      })
      
      // Note: The actual success handling happens in the sso-callback page
      // This is just for immediate UI feedback
      onSuccess?.({ provider: 'google' })
      
    } catch (error: any) {
      console.error('Clerk Google Sign-In failed:', error)
      
      const errorMessage = language === 'en' 
        ? 'Google Sign-In failed. Please try again.'
        : 'Не удалось войти через Google. Попробуйте еще раз.'
      
      onError?.(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className={`
        w-full group relative overflow-hidden rounded-xl p-4 border-2 border-dashed
        transition-all duration-300 
        ${isLoading ? 'cursor-not-allowed opacity-50' : 'hover:scale-[1.02] hover:shadow-xl'}
        ${theme === 'dark' 
          ? 'border-gray-600 bg-gray-800/50 hover:border-blue-500 hover:bg-gray-700/70' 
          : 'border-gray-300 bg-white/50 hover:border-blue-500 hover:bg-blue-50/70'
        }
        ${className}
      `}
    >
      {/* Background gradient effect */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
        ${theme === 'dark' 
          ? 'bg-gradient-to-r from-blue-600/10 to-indigo-600/10' 
          : 'bg-gradient-to-r from-blue-500/5 to-indigo-500/5'
        }
      `} />
      
      <div className="relative flex items-center justify-center gap-3">
        {/* Google Icon */}
        <div className="flex-shrink-0">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg 
              className="w-5 h-5" 
              viewBox="0 0 24 24"
            >
              <path 
                fill="#4285F4" 
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path 
                fill="#34A853" 
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path 
                fill="#FBBC05" 
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path 
                fill="#EA4335" 
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
        </div>
        
        {/* Button Text */}
        <span className={`
          font-medium text-sm
          ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}
          group-hover:text-blue-600 transition-colors duration-300
        `}>
          {isLoading 
            ? (language === 'en' ? 'Signing in...' : 'Вход...')
            : (language === 'en' ? 'Continue with Google' : 'Войти через Google')
          }
        </span>
      </div>
    </button>
  )
}

export default ClerkGoogleSignInButton 