'use client'

/**
 * Credits Administration Utilities
 * Утилиты для администрирования системы кредитов
 */

// Function to clear all credits data from localStorage
export const clearAllCreditsStorage = (): void => {
  if (typeof window === 'undefined') return
  
  const keys = Object.keys(localStorage)
  const creditKeys = keys.filter(key => key.startsWith('user_credits_'))
  
  creditKeys.forEach(key => {
    localStorage.removeItem(key)
    console.log(`🧹 Removed credits data: ${key}`)
  })
  
  // Also remove old general credit key if exists
  localStorage.removeItem('user_credits')
  
  console.log(`✅ Cleared ${creditKeys.length} user credit entries`)
}

// Function to inspect current credits storage
export const inspectCreditsStorage = (): Record<string, number> => {
  if (typeof window === 'undefined') return {}
  
  const keys = Object.keys(localStorage)
  const creditKeys = keys.filter(key => key.startsWith('user_credits_'))
  const credits: Record<string, number> = {}
  
  creditKeys.forEach(key => {
    const value = localStorage.getItem(key)
    if (value) {
      credits[key] = parseInt(value, 10)
    }
  })
  
  console.log('📊 Current credits storage:', credits)
  return credits
}

// Function to manually set credits for a specific user
export const setUserCredits = (userId: string, credits: number): void => {
  if (typeof window === 'undefined') return
  
  const storageKey = `user_credits_${userId}`
  localStorage.setItem(storageKey, credits.toString())
  console.log(`💰 Set credits for user ${userId}: ${credits}`)
}

// Function to get admin user identifiers for debugging
export const getAdminIdentifiers = (): string[] => {
  return [
    'alikhanmajor10',
    'alikhanmajor10@gmail.com',
    'alikhan major' // firstName lastName combination
  ]
}

// Function to check if an identifier matches admin criteria
export const isAdminIdentifier = (identifier: string): boolean => {
  const adminIds = getAdminIdentifiers()
  const normalizedId = identifier.toLowerCase()
  
  return adminIds.some(adminId => 
    normalizedId.includes(adminId.toLowerCase()) ||
    adminId.toLowerCase().includes(normalizedId)
  )
}

// Development helper to simulate different user types
export const simulateUserCredits = (userType: 'admin' | 'regular'): void => {
  if (typeof window === 'undefined') return
  
  const mockUserId = userType === 'admin' ? 'admin_test_user' : 'regular_test_user'
  const credits = userType === 'admin' ? 100 : 10
  
  setUserCredits(mockUserId, credits)
  console.log(`🎭 Simulated ${userType} user with ${credits} credits`)
}

// Function to validate credits system integrity
export const validateCreditsSystem = (): {
  isValid: boolean
  issues: string[]
} => {
  const issues: string[] = []
  
  // Check if localStorage is available
  if (typeof window === 'undefined') {
    issues.push('localStorage not available (server-side)')
  }
  
  // Check for old non-user-specific keys
  if (typeof window !== 'undefined' && localStorage.getItem('user_credits')) {
    issues.push('Found old non-user-specific credits key - should be migrated')
  }
  
  // Check credits storage format
  const storage = inspectCreditsStorage()
  Object.keys(storage).forEach(key => {
    if (!key.startsWith('user_credits_')) {
      issues.push(`Invalid credits key format: ${key}`)
    }
    
    const value = storage[key]
    if (isNaN(value) || value < 0) {
      issues.push(`Invalid credits value for ${key}: ${value}`)
    }
  })
  
  return {
    isValid: issues.length === 0,
    issues
  }
}

// Console commands for development
export const creditsDevCommands = {
  clear: clearAllCreditsStorage,
  inspect: inspectCreditsStorage,
  setCredits: setUserCredits,
  simulate: simulateUserCredits,
  validate: validateCreditsSystem,
  help: () => {
    console.log(`
🛠️  Credits Development Commands:

creditsDevCommands.clear()              - Clear all credits storage
creditsDevCommands.inspect()            - Show current credits storage
creditsDevCommands.setCredits(userId, amount) - Set credits for user
creditsDevCommands.simulate('admin')    - Simulate admin user
creditsDevCommands.simulate('regular')  - Simulate regular user
creditsDevCommands.validate()           - Validate system integrity
creditsDevCommands.help()               - Show this help

Admin identifiers: ${getAdminIdentifiers().join(', ')}
    `)
  }
}

// Make available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).creditsDevCommands = creditsDevCommands
  console.log('🛠️  Credits dev commands available globally as window.creditsDevCommands')
  console.log('💡 Run creditsDevCommands.help() for available commands')
} 