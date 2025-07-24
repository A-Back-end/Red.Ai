import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ensureUserExists } from '@/lib/user-sync'
import type { ClerkUser } from '@/lib/user-sync'

export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current user from Clerk
    const { currentUser } = await import('@clerk/nextjs/server')
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'User not found in Clerk' },
        { status: 404 }
      )
    }

    // Ensure user exists in database
    const dbUser = await ensureUserExists(clerkUser as unknown as ClerkUser)
    
    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        clerkId: dbUser.clerkId
      }
    })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 