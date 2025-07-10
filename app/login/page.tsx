'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { NeuralBackground } from '@/components/NeuralBackground'
import { useTranslations } from '@/lib/translations'
import { useAppStore } from '@/lib/store'
import { initThemeSync, getSavedTheme, getSavedLanguage } from '@/lib/theme-sync'

import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { LogoShowcase } from '@/components/landing/LogoShowcase'
import { Testimonials } from '@/components/landing/Testimonials'
import { CTA } from '@/components/landing/CTA'

export default function AuthPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const { language, setLanguage, translations } = useTranslations()
  const { setLanguage: setStoreLanguage } = useAppStore()

  useEffect(() => {
    if (isLoaded && user) {
      router.push('/dashboard')
      return
    }

    initThemeSync()
    const savedTheme = getSavedTheme()
    const savedLanguage = getSavedLanguage()
    
    setTheme(savedTheme)
    setLanguage(savedLanguage)
    setStoreLanguage(savedLanguage)
  }, [isLoaded, user, router, setLanguage, setStoreLanguage])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  if (!isLoaded || !translations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen font-sans ${theme}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <NeuralBackground />
        
        <div className="relative min-h-screen flex flex-col lg:flex-row">
          <Hero theme={theme} toggleTheme={toggleTheme} language={language} translations={translations} />
          
          <div className="w-full lg:w-1/2 p-6 md:p-12 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <Features translations={translations} />
              <LogoShowcase translations={translations} />
              <Testimonials translations={translations} />
              <CTA translations={translations} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 