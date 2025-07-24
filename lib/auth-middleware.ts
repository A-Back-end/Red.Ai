import { auth } from '@clerk/nextjs/server'
import { ensureUserExists } from './user-sync'
import type { ClerkUser } from './user-sync'

/**
 * Middleware function to ensure user exists in database
 * This should be called in protected routes to sync users
 */
export async function ensureUserInDatabase() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error('User not authenticated')
    }

    // Get user data from Clerk
    const { currentUser } = await import('@clerk/nextjs/server')
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      throw new Error('User not found in Clerk')
    }

    // Ensure user exists in our database
    const dbUser = await ensureUserExists(clerkUser as any)
    
    return {
      userId,
      user: dbUser,
      clerkUser
    }
  } catch (error) {
    console.error('Error ensuring user in database:', error)
    throw error
  }
}

/**
 * Get current user from database
 */
export async function getCurrentUser() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return null
    }

    const { prisma } = await import('./prisma')
    return await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        credits: true,
        projects: {
          include: {
            images: true
          }
        },
        designs: {
          include: {
            images: true
          }
        }
      }
    })
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
} 