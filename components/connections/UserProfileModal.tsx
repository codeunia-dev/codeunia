'use client'

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  MapPin, 
  Briefcase, 
  Building, 
  Github, 
  Linkedin, 
  Twitter,
  Loader2,
  ExternalLink,
  MessageCircle,
  UserPlus,
  UserMinus
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { connectionService } from '@/lib/services/connectionService'
import { conversationService } from '@/lib/services/conversationService'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserProfileModalProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnectionChange?: () => void
}

interface ProfileData {
  id: string
  first_name: string | null
  last_name: string | null
  username: string
  avatar_url: string | null
  bio: string | null
  location: string | null
  current_position: string | null
  company: string | null
  skills: string[] | null
  github_url: string | null
  linkedin_url: string | null
  twitter_url: string | null
  is_public: boolean
}

export function UserProfileModal({ 
  userId, 
  open, 
  onOpenChange,
  onConnectionChange 
}: UserProfileModalProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState({
    isFollowing: false,
    isFollower: false,
    isMutual: false
  })

  const loadProfile = React.useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const loadConnectionStatus = React.useCallback(async () => {
    try {
      const status = await connectionService.getConnectionStatus(userId)
      setConnectionStatus(status)
    } catch (error) {
      console.error('Error loading connection status:', error)
    }
  }, [userId])

  useEffect(() => {
    if (open && userId) {
      loadProfile()
      loadConnectionStatus()
    }
  }, [open, userId, loadProfile, loadConnectionStatus])

  const handleFollow = async () => {
    try {
      setActionLoading(true)
      await connectionService.followUser(userId)
      await loadConnectionStatus()
      onConnectionChange?.()
    } catch (error) {
      console.error('Error following user:', error)
      alert(error instanceof Error ? error.message : 'Failed to follow user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnfollow = async () => {
    try {
      setActionLoading(true)
      await connectionService.unfollowUser(userId)
      await loadConnectionStatus()
      onConnectionChange?.()
    } catch (error) {
      console.error('Error unfollowing user:', error)
      alert(error instanceof Error ? error.message : 'Failed to unfollow user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleMessage = async () => {
    try {
      setActionLoading(true)
      const { canMessage, reason } = await conversationService.canMessageUser(userId)
      
      if (!canMessage) {
        alert(reason || 'Cannot message this user')
        return
      }
      
      const conversation = await conversationService.getOrCreateConversation(userId)
      onOpenChange(false)
      router.push(`/protected/messages?conversation=${conversation.id}`)
    } catch (error) {
      console.error('Error creating conversation:', error)
      alert(error instanceof Error ? error.message : 'Failed to create conversation')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading || !profile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || profile.username[0].toUpperCase()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">User Profile</DialogTitle>
        </DialogHeader>

        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <Avatar className="w-24 h-24">
            {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt={name} />}
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>

          {/* Connection Badges */}
          <div className="flex gap-2">
            {connectionStatus.isMutual && (
              <Badge variant="secondary">Connected</Badge>
            )}
            {!connectionStatus.isMutual && connectionStatus.isFollower && (
              <Badge variant="outline">Follows you</Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full max-w-md">
            {connectionStatus.isMutual && (
              <Button
                onClick={handleMessage}
                disabled={actionLoading}
                className="flex-1 gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </Button>
            )}
            
            {connectionStatus.isFollowing ? (
              <Button
                onClick={handleUnfollow}
                disabled={actionLoading}
                variant="outline"
                className="flex-1 gap-2"
              >
                <UserMinus className="h-4 w-4" />
                Unfollow
              </Button>
            ) : (
              <Button
                onClick={handleFollow}
                disabled={actionLoading}
                className="flex-1 gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Follow
              </Button>
            )}

            <Button
              asChild
              variant="ghost"
              size="icon"
              title="View Full Profile"
            >
              <Link href={`/${profile.username}`} target="_blank">
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Profile Details */}
        <div className="space-y-4">
          {/* Bio */}
          {profile.bio && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
          )}

          {/* Professional Info */}
          {(profile.current_position || profile.company || profile.location) && (
            <div className="space-y-2">
              {profile.current_position && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.current_position}</span>
                </div>
              )}
              {profile.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.company}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {(profile.github_url || profile.linkedin_url || profile.twitter_url) && (
            <div>
              <h3 className="font-semibold mb-2">Social Links</h3>
              <div className="flex gap-2">
                {profile.github_url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                {profile.linkedin_url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {profile.twitter_url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
