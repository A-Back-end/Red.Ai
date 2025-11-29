'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ClerkDebugInfo from '@/components/debug/ClerkDebugInfo'

// Force dynamic rendering for Clerk authentication (ClerkDebugInfo uses useUser)
export const dynamic = 'force-dynamic'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if we should redirect to the static page
    const shouldRedirect = true // Set to false to test the React page
    
    if (shouldRedirect) {
      window.location.href = '/index.html'
    } else {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading RED AI...</p>
        </div>
      </div>
    )
  }

  // Test page content
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            RED AI Platform
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            AI-powered real estate design platform
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/dashboard" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
            
            <div className="mt-8">
              <Link 
                href="/index.html" 
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View Static Landing Page
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug component - показывается только в development */}
      <ClerkDebugInfo showDebug={true} />
    </div>
  )
} 