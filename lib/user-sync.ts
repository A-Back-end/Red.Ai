import { prisma } from './prisma'

export interface ClerkUser {
  id: string
  emailAddresses: Array<{
    emailAddress: string
    id: string
    linkedTo: Array<any>
    object: string
    verification: {
      status: string
      strategy: string
    }
  }>
  firstName?: string
  lastName?: string
  imageUrl?: string
  createdAt: number
  updatedAt: number
}

/**
 * Creates a new user in the database from Clerk user data
 */
export async function createUserFromClerk(clerkUser: ClerkUser) {
  const primaryEmail = clerkUser.emailAddresses.find(
    (email: any) => email.id === clerkUser.emailAddresses[0]?.id
  )?.emailAddress

  if (!primaryEmail) {
    throw new Error('No primary email found for user')
  }

  const name = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(' ')

  try {
    const user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: primaryEmail,
        name: name || null,
        imageUrl: clerkUser.imageUrl || null,
      },
    })

    // Create initial credits for the user
    await prisma.credit.create({
      data: {
        userId: user.id,
        amount: 10, // Give 10 free credits to new users
      },
    })

    console.log(`✅ Created user in database: ${user.email}`)
    return user
  } catch (error) {
    console.error('❌ Error creating user in database:', error)
    throw error
  }
}

/**
 * Updates an existing user in the database from Clerk user data
 */
export async function updateUserFromClerk(clerkUser: ClerkUser) {
  const primaryEmail = clerkUser.emailAddresses.find(
    (email: any) => email.id === clerkUser.emailAddresses[0]?.id
  )?.emailAddress

  if (!primaryEmail) {
    throw new Error('No primary email found for user')
  }

  const name = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(' ')

  try {
    const user = await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: {
        email: primaryEmail,
        name: name || null,
        imageUrl: clerkUser.imageUrl || null,
      },
    })

    console.log(`✅ Updated user in database: ${user.email}`)
    return user
  } catch (error) {
    console.error('❌ Error updating user in database:', error)
    throw error
  }
}

/**
 * Deletes a user from the database by Clerk ID
 */
export async function deleteUserFromClerk(clerkId: string): Promise<void> {
  try {
    await prisma.user.delete({
      where: { clerkId },
    })

    console.log(`✅ Deleted user from database: ${clerkId}`)
  } catch (error) {
    console.error('❌ Error deleting user from database:', error)
    throw error
  }
}

/**
 * Finds a user in the database by Clerk ID
 */
export async function findUserByClerkId(clerkId: string) {
  try {
    return await prisma.user.findUnique({
      where: { clerkId },
    })
  } catch (error) {
    console.error('❌ Error finding user by Clerk ID:', error)
    return null
  }
}

/**
 * Ensures a user exists in the database, creating if necessary
 */
export async function ensureUserExists(clerkUser: ClerkUser) {
  const existingUser = await findUserByClerkId(clerkUser.id)
  
  if (existingUser) {
    return existingUser
  }

  return await createUserFromClerk(clerkUser)
} 