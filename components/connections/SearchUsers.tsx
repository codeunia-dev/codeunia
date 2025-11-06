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
      <div className="flex flex-col items-center justify-center p-16 text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative bg-primary/10 p-6 rounded-full border border-primary/20">
            <Search className="h-16 w-16 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Discover New Connections</h3>
          <p className="text-muted-foreground max-w-md">
            Search for users by name or username to expand your network
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Type at least 2 characters to start searching</span>
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center space-y-6">
        <div className="relative">
          <div className="bg-muted/50 p-6 rounded-full border border-border">
            <Search className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">No users found</h3>
          <p className="text-muted-foreground max-w-md">
            We couldn&apos;t find anyone matching &quot;{searchQuery}&quot;
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Try searching with a different name or username
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Result count header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          Found <span className="font-semibold text-foreground">{users.length}</span> {users.length === 1 ? 'user' : 'users'}
        </p>
      </div>

      {/* User list */}
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
    </div>
  )
}
