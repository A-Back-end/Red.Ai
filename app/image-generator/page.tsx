'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ImageGeneratorPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to dashboard since ImageGenerator is now part of the dashboard
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to Dashboard...</h1>
        <p className="text-gray-600">Image Generator is now available in the main dashboard.</p>
      </div>
    </div>
  )
} 