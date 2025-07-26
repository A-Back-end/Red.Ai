'use client'

import { useEffect } from 'react'

/**
 * Optimized Head Component
 * Handles CSS loading optimization to prevent preload warnings
 */
export function OptimizedHead() {
  useEffect(() => {
    // Remove any existing preload links that might cause warnings
    const preloadLinks = document.querySelectorAll('link[rel="preload"][as="style"]')
    preloadLinks.forEach(link => {
      if (link.getAttribute('href')?.includes('layout.css')) {
        link.remove()
      }
    })

    // Ensure CSS is loaded properly
    const existingCSS = document.querySelector('link[href*="layout.css"]')
    if (!existingCSS) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/_next/static/css/app/layout.css'
      document.head.appendChild(link)
    }
  }, [])

  return null
} 