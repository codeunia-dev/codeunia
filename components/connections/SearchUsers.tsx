'use client'

import React, { useEffect, useState } from 'react'
import { UserCard } from './UserCard'
import { Loader2, Search } from 'lucide-react'
import { conversationService } from '@/lib/services/conversationService'
import { connectionService } from '@/lib/services/connectionService'

interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  username: string
  avatar_url: string | null
  bio?: string | null
}

interface SearchUsersProps {
  searchQuery: string
}

export function SearchUsers({ searchQuery }: SearchUsersProps) {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, { isFollowing: boolean; isFollower: boolean; isMutual: boolean }>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setUsers([])
        return
      }

      try {
        setLoading(true)
        const results = await conversationService.searchUsers(searchQuery)
        setUsers(results)

        // Load connection statuses for all users
        const statuses: Record<string, { isFollowing: boolean; isFollower: boolean; isMutual: boolean }> = {}
        await Promise.all(
          results.map(async (user) => {
            const status = await connectionService.getConnectionStatus(user.id)
            statuses[user.id] = status
          })
        )
        setConnectionStatuses(statuses)
      } catch (error) {
        console.error('Error searching users:', error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleConnectionChange = async () => {
    // Reload connection statuses
    const statuses: Record<string, { isFollowing: boolean; isFollower: boolean; isMutual: boolean }> = {}
    await Promise.all(
      users.map(async (user) => {
        const status = await connectionService.getConnectionStatus(user.id)
        statuses[user.id] = status
      })
    )
    setConnectionStatuses(statuses)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (searchQuery.trim().length < 2) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Search for users</h3>
        <p className="text-muted-foreground">
          Type at least 2 characters to search
        </p>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Search className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No users found</h3>
        <p className="text-muted-foreground">
          Try a different search term
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          connectionStatus={connectionStatuses[user.id]}
          onConnectionChange={handleConnectionChange}
        />
      ))}
    </div>
  )
}
