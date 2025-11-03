'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, MessageCircle } from 'lucide-react'
import { conversationService } from '@/lib/services/conversationService'
import { connectionService } from '@/lib/services/connectionService'
import { useRouter } from 'next/navigation'

interface NewMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UserSearchResult {
  id: string
  first_name: string | null
  last_name: string | null
  username: string
  avatar_url: string | null
  canMessage?: boolean
  connectionStatus?: {
    isFollowing: boolean
    isFollower: boolean
    isMutual: boolean
  }
}

export function NewMessageDialog({ open, onOpenChange }: NewMessageDialogProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [creating, setCreating] = useState(false)
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set())

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    
    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const results = await conversationService.searchUsers(query)
      
      // Enrich results with connection status and message permission
      const enrichedResults = await Promise.all(
        results.map(async (user) => {
          const [connectionStatus, { canMessage }] = await Promise.all([
            connectionService.getConnectionStatus(user.id),
            conversationService.canMessageUser(user.id)
          ])
          
          return {
            ...user,
            connectionStatus,
            canMessage
          }
        })
      )
      
      setSearchResults(enrichedResults)
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleFollow = async (userId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    
    try {
      await connectionService.followUser(userId)
      setFollowingUsers(prev => new Set(prev).add(userId))
      
      // Refresh search results to update connection status
      if (searchQuery) {
        await handleSearch(searchQuery)
      }
    } catch (error) {
      console.error('Error following user:', error)
      alert(error instanceof Error ? error.message : 'Failed to follow user')
    }
  }

  const handleUnfollow = async (userId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    
    try {
      await connectionService.unfollowUser(userId)
      setFollowingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
      
      // Refresh search results to update connection status
      if (searchQuery) {
        await handleSearch(searchQuery)
      }
    } catch (error) {
      console.error('Error unfollowing user:', error)
      alert(error instanceof Error ? error.message : 'Failed to unfollow user')
    }
  }

  const handleSelectUser = async (userId: string) => {
    try {
      setCreating(true)
      
      // Check if user can message this person
      const { canMessage, reason } = await conversationService.canMessageUser(userId)
      
      if (!canMessage) {
        alert(reason || 'Cannot message this user')
        setCreating(false)
        return
      }
      
      const conversation = await conversationService.getOrCreateConversation(userId)
      onOpenChange(false)
      setSearchQuery('')
      setSearchResults([])
      router.push(`/protected/messages?conversation=${conversation.id}`)
    } catch (error) {
      console.error('Error creating conversation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation'
      alert(errorMessage)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          {/* Search Results */}
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {searching ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => {
                const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
                const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U'
                const isFollowing = user.connectionStatus?.isFollowing || followingUsers.has(user.id)
                const isMutual = user.connectionStatus?.isMutual || false
                const isFollower = user.connectionStatus?.isFollower || false

                return (
                  <div
                    key={user.id}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      {user.avatar_url && <AvatarImage src={user.avatar_url} alt={name} />}
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{name}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                        {isMutual && (
                          <Badge variant="secondary" className="text-xs">
                            Connected
                          </Badge>
                        )}
                        {!isMutual && isFollower && (
                          <Badge variant="outline" className="text-xs">
                            Follows you
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {user.canMessage ? (
                        <Button
                          onClick={() => handleSelectUser(user.id)}
                          disabled={creating}
                          size="sm"
                          className="gap-1"
                        >
                          <MessageCircle className="h-3 w-3" />
                          Message
                        </Button>
                      ) : (
                        <>
                          {isFollowing ? (
                            <Button
                              onClick={(e) => handleUnfollow(user.id, e)}
                              disabled={creating}
                              size="sm"
                              variant="outline"
                            >
                              Following
                            </Button>
                          ) : (
                            <Button
                              onClick={(e) => handleFollow(user.id, e)}
                              disabled={creating}
                              size="sm"
                            >
                              Follow
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })
            ) : searchQuery.trim().length >= 2 ? (
              <div className="text-center p-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                Type to search for users
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
