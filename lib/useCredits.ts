'use client'

import { useState, useCallback, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

interface CreditsState {
  credits: number
  isGenerating: boolean
  canGenerate: boolean
}

const ADMIN_CREDITS = 100
const REGULAR_CREDITS = 10
const GENERATION_COST = 10

// Function to check if user is admin
const isAdminUser = (user: any): boolean => {
  if (!user) return false
  
  // Check by username
  if (user.username === 'alikhanmajor10') return true
  
  // Check by email if username is not available
  const email = user.primaryEmailAddress?.emailAddress
  if (email && (
    email === 'alikhanmajor10@gmail.com' ||
    email.includes('alikhanmajor10')
  )) return true
  
  // Check by firstName/lastName combination
  if (user.firstName && user.lastName) {
    const fullName = `${user.firstName}${user.lastName}`.toLowerCase()
    if (fullName.includes('alikhan') && fullName.includes('major')) return true
  }
  
  return false
}

export function useCredits() {
  const { user, isLoaded } = useUser()
  
  const [state, setState] = useState<CreditsState>(() => {
    // Initial state will be updated once user is loaded
    return {
      credits: REGULAR_CREDITS,
      isGenerating: false,
      canGenerate: true
    }
  })

  // Initialize credits based on user once loaded
  useEffect(() => {
    if (!isLoaded || !user) return

    const isAdmin = isAdminUser(user)
    const initialCredits = isAdmin ? ADMIN_CREDITS : REGULAR_CREDITS
    
    // Create user-specific localStorage key
    const storageKey = `user_credits_${user.id}`
    
    if (typeof window !== 'undefined') {
      const savedCredits = localStorage.getItem(storageKey)
      
      if (savedCredits !== null) {
        // If credits are saved, use them but ensure admin always gets correct amount
        const credits = parseInt(savedCredits, 10)
        const finalCredits = isAdmin && credits < ADMIN_CREDITS ? ADMIN_CREDITS : credits
        
        setState({
          credits: finalCredits,
          isGenerating: false,
          canGenerate: finalCredits >= GENERATION_COST
        })
        
        // Update localStorage if we adjusted the credits
        if (finalCredits !== credits) {
          localStorage.setItem(storageKey, finalCredits.toString())
        }
      } else {
        // First time login - set initial credits
        setState({
          credits: initialCredits,
          isGenerating: false,
          canGenerate: initialCredits >= GENERATION_COST
        })
        localStorage.setItem(storageKey, initialCredits.toString())
      }
    }
  }, [isLoaded, user])

  // Save credits to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id) {
      const storageKey = `user_credits_${user.id}`
      localStorage.setItem(storageKey, state.credits.toString())
    }
  }, [state.credits, user?.id])

  const spendCredits = useCallback((amount: number = GENERATION_COST) => {
    setState(prev => {
      const newCredits = Math.max(0, prev.credits - amount)
      return {
        ...prev,
        credits: newCredits,
        canGenerate: newCredits >= GENERATION_COST
      }
    })
  }, [])

  const setGenerating = useCallback((generating: boolean) => {
    setState(prev => ({
      ...prev,
      isGenerating: generating
    }))
  }, [])

  const resetCredits = useCallback(() => {
    if (!user) return
    
    const isAdmin = isAdminUser(user)
    const initialCredits = isAdmin ? ADMIN_CREDITS : REGULAR_CREDITS
    
    setState({
      credits: initialCredits,
      isGenerating: false,
      canGenerate: true
    })
    
    // Also reset in localStorage with user-specific key
    if (typeof window !== 'undefined') {
      const storageKey = `user_credits_${user.id}`
      localStorage.setItem(storageKey, initialCredits.toString())
    }
  }, [user])

  const clearCreditsStorage = useCallback(() => {
    if (!user) return
    
    const isAdmin = isAdminUser(user)
    const initialCredits = isAdmin ? ADMIN_CREDITS : REGULAR_CREDITS
    const storageKey = `user_credits_${user.id}`
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
    }
    setState({
      credits: initialCredits,
      isGenerating: false,
      canGenerate: true
    })
  }, [user])

  return {
    credits: state.credits,
    isGenerating: state.isGenerating,
    canGenerate: state.canGenerate,
    spendCredits,
    setGenerating,
    resetCredits,
    clearCreditsStorage, // For admin/testing purposes
    GENERATION_COST,
    INITIAL_CREDITS: user && isAdminUser(user) ? ADMIN_CREDITS : REGULAR_CREDITS,
    isAdminUser: user ? isAdminUser(user) : false
  }
} 