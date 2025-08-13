'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  imageUrl?: string
  username?: string
  createdAt: Date
  lastSignInAt?: Date
}

export function useUserProfile() {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (isLoaded && user) {
      const userProfile: UserProfile = {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User',
        imageUrl: user.imageUrl,
        username: user.username || undefined,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt) : undefined,
      }
      setProfile(userProfile)
    } else if (isLoaded && !user) {
      setProfile(null)
    }
  }, [user, isLoaded])

  const getDisplayName = (): string => {
    if (!profile) return 'User'
    
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`
    }
    
    if (profile.firstName) {
      return profile.firstName
    }
    
    if (profile.username) {
      return profile.username
    }
    
    return 'User'
  }

  const getInitials = (): string => {
    if (!profile) return 'U'
    
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`
    }
    
    if (profile.firstName) {
      return profile.firstName[0]
    }
    
    if (profile.username) {
      return profile.username[0]
    }
    
    return 'U'
  }

  const getAvatarUrl = (): string | undefined => {
    return profile?.imageUrl
  }

  const isProfileComplete = (): boolean => {
    if (!profile) return false
    return !!(profile.firstName && profile.lastName && profile.email)
  }

  const updateUserProfile = async (newFullName: string) => {
    if (!user) {
      throw new Error('User not loaded.');
    }

    const nameParts = newFullName.split(' ').filter(Boolean);
    let newFirstName = '';
    let newLastName = '';

    if (nameParts.length > 0) {
      newFirstName = nameParts[0];
      if (nameParts.length > 1) {
        newLastName = nameParts.slice(1).join(' ');
      }
    }

    try {
      await user.update({
        firstName: newFirstName,
        lastName: newLastName,
      });
      // Re-fetch or update the local profile state after successful update
      setProfile({
        ...profile,
        firstName: newFirstName,
        lastName: newLastName,
        fullName: `${newFirstName} ${newLastName}`.trim(),
      } as UserProfile); // Cast to UserProfile to ensure type compatibility
      
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  return {
    profile,
    isLoaded,
    getDisplayName,
    getInitials,
    getAvatarUrl,
    isProfileComplete,
    updateUserProfile, // Export the new function
  }
} 