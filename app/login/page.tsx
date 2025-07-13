'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { NeuralBackground } from '@/components/NeuralBackground'
import { AuthForm } from '@/components/auth/AuthForm'

export default function LoginPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded && user) {
      router.push('/dashboard')
    }
  }, [isLoaded, user, router])

  if (isLoaded && user) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400">Redirecting to dashboard...</p>
            </div>
        </div>
    );
  }

  return (
    <>
      <NeuralBackground />
      <AuthForm />
    </>
  )
} 