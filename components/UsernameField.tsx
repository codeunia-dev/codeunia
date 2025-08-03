"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Edit, Lock, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface UsernameFieldProps {
  currentUsername?: string
  usernameEditable?: boolean
  userId: string
  onUsernameChange?: (username: string) => void
  className?: string
}

export function UsernameField({
  currentUsername,
  usernameEditable = true,
  userId,
  onUsernameChange,
  className = ""
}: UsernameFieldProps) {
  const [username, setUsername] = useState(currentUsername || "")
  const [isEditing, setIsEditing] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClient()

  // Check username availability
  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setIsAvailable(null)
      return
    }

    setIsChecking(true)
    setError("")

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', usernameToCheck)
        .neq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      // If no data found, username is available
      setIsAvailable(!data)
    } catch (error) {
      console.error('Error checking username:', error)
      setIsAvailable(null)
    } finally {
      setIsChecking(false)
    }
  }

  // Debounced username availability check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username && username !== currentUsername) {
        checkUsernameAvailability(username)
      } else {
        setIsAvailable(null)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [username, currentUsername, userId])

  // Save username
  const saveUsername = async () => {
    if (!username || username.length < 3) {
      setError("Username must be at least 3 characters long")
      return
    }

    if (username.length > 30) {
      setError("Username must be less than 30 characters")
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError("Username can only contain letters, numbers, underscores, and hyphens")
      return
    }

    if (isAvailable === false) {
      setError("Username is already taken")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const { data, error } = await supabase.rpc('update_username', {
        user_id: userId,
        new_username: username
      })

      if (error) {
        if (error.message.includes('Username can only be changed once')) {
          setError("You can only change your username once")
        } else if (error.message.includes('Username is already taken')) {
          setError("Username is already taken")
        } else if (error.message.includes('User not found')) {
          setError("User not found")
        } else {
          console.error('Username update error:', error)
          setError("Failed to update username: " + error.message)
        }
        return
      }

      if (data) {
        toast.success("Username updated successfully!")
        setIsEditing(false)
        // Update the local state to reflect that username is no longer editable
        onUsernameChange?.(username)
      } else {
        setError("Failed to update username")
      }
    } catch (error) {
      console.error('Error updating username:', error)
      setError("Failed to update username")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = () => {
    if (!usernameEditable) {
      toast.error("You can only change your username once")
      return
    }
    setIsEditing(true)
    setError("")
  }

  const handleCancel = () => {
    setIsEditing(false)
    setUsername(currentUsername || "")
    setError("")
    setIsAvailable(null)
  }

  if (!isEditing) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Username *
          </label>
          {usernameEditable ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 px-2"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          ) : (
            <Badge variant="secondary" className="text-xs">
              <Lock className="h-3 w-3 mr-1" />
              Locked
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Input
            value={username}
            disabled
            className="bg-muted"
            placeholder="Enter username"
          />
          {username && (
            <Badge variant="outline" className="text-xs">
              @{username}
            </Badge>
          )}
        </div>
        
        {!usernameEditable && (
          <p className="text-xs text-muted-foreground">
            You can only change your username once. This username is now locked.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Username *
        </label>
        <Badge variant="outline" className="text-xs">
          One-time edit
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username (3-30 characters)"
            className="flex-1"
            maxLength={30}
          />
          {isChecking && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}
          {isAvailable === true && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          {isAvailable === false && (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
        
        {username && (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              @{username}
            </Badge>
            {isAvailable === true && (
              <span className="text-xs text-green-600">Available</span>
            )}
            {isAvailable === false && (
              <span className="text-xs text-red-600">Already taken</span>
            )}
          </div>
        )}
        
        {error && (
          <div className="flex items-center space-x-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          Username can only contain letters, numbers, underscores, and hyphens.
          You can only change this once.
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          onClick={saveUsername}
          disabled={isSaving || isChecking || isAvailable === false || !username || username.length < 3}
          size="sm"
        >
          {isSaving ? "Saving..." : "Save Username"}
        </Button>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isSaving}
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
} 
 
 
 