'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function UserSyncTest() {
  const { user, isLoaded } = useUser()
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [syncResult, setSyncResult] = useState<any>(null)

  const handleSync = async () => {
    if (!user) return

    setSyncStatus('loading')
    try {
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok) {
        setSyncStatus('success')
        setSyncResult(result)
      } else {
        setSyncStatus('error')
        setSyncResult(result)
      }
    } catch (error) {
      setSyncStatus('error')
      setSyncResult({ error: 'Network error' })
    }
  }

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Please sign in to test user sync</div>
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>User Sync Test</CardTitle>
        <CardDescription>
          Test the synchronization between Clerk and your database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Current User (Clerk)</h4>
          <div className="text-sm space-y-1">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
            <p><strong>Name:</strong> {user.fullName}</p>
          </div>
        </div>

        <Button 
          onClick={handleSync} 
          disabled={syncStatus === 'loading'}
          className="w-full"
        >
          {syncStatus === 'loading' ? 'Syncing...' : 'Sync to Database'}
        </Button>

        {syncStatus === 'success' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <h4 className="font-medium text-green-800">Sync Successful</h4>
            <pre className="text-xs text-green-700 mt-2">
              {JSON.stringify(syncResult, null, 2)}
            </pre>
          </div>
        )}

        {syncStatus === 'error' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <h4 className="font-medium text-red-800">Sync Failed</h4>
            <pre className="text-xs text-red-700 mt-2">
              {JSON.stringify(syncResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 