'use client'

import React, { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, X, AlertCircle, Crop } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ImageCropper } from './ImageCropper'

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string
  userId: string
  firstName?: string
  lastName?: string
  onUploadComplete: (avatarUrl: string) => void
}

export function ProfilePictureUpload({
  currentAvatarUrl,
  userId,
  firstName,
  lastName,
  onUploadComplete
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update preview when currentAvatarUrl changes
  React.useEffect(() => {
    setPreviewUrl(currentAvatarUrl || null)
  }, [currentAvatarUrl])

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`
    }
    if (firstName) {
      return firstName[0].toUpperCase()
    }
    return 'U'
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    // Read file and show cropper
    const reader = new FileReader()
    reader.onload = () => {
      setSelectedImage(reader.result as string)
      setShowCropper(true)
      setError(null)
    }
    reader.readAsDataURL(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const deleteOldAvatar = async (oldAvatarUrl: string) => {
    try {
      const supabase = createClient()
      
      // Extract file path from URL
      // URL format: https://.../storage/v1/object/public/profile-pictures/avatars/filename.jpg
      const urlParts = oldAvatarUrl.split('/storage/v1/object/public/profile-pictures/')
      if (urlParts.length < 2) return
      
      const filePath = urlParts[1]
      
      // Delete the old file
      const { error } = await supabase.storage
        .from('profile-pictures')
        .remove([filePath])
      
      if (error) {
        console.error('Error deleting old avatar:', error)
        // Don't throw - we still want the upload to succeed even if deletion fails
      }
    } catch (err) {
      console.error('Error in deleteOldAvatar:', err)
      // Don't throw - non-critical error
    }
  }

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    try {
      setUploading(true)
      setShowCropper(false)
      setError(null)

      const supabase = createClient()

      // Delete old avatar if it exists
      if (previewUrl) {
        await deleteOldAvatar(previewUrl)
      }

      // Create a unique file name
      const fileName = `${userId}-${Date.now()}.jpg`
      const filePath = `avatars/${fileName}`

      // Upload cropped image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, croppedImageBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg'
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath)

      // Update preview
      setPreviewUrl(publicUrl)

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      // Notify parent component
      onUploadComplete(publicUrl)
    } catch (err) {
      console.error('Error uploading avatar:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
      setSelectedImage(null)
    }
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setSelectedImage(null)
  }

  const handleRemoveAvatar = async () => {
    try {
      setUploading(true)
      setError(null)

      const supabase = createClient()

      // Delete the avatar file from storage
      if (previewUrl) {
        await deleteOldAvatar(previewUrl)
      }

      // Update profile to remove avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      setPreviewUrl(null)
      onUploadComplete('')
    } catch (err) {
      console.error('Error removing avatar:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Label>Profile Picture</Label>
      
      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="w-24 h-24">
            {previewUrl && <AvatarImage src={previewUrl} alt="Profile picture" />}
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            <Crop className="h-4 w-4" />
            {previewUrl ? 'Change Picture' : 'Upload Picture'}
          </Button>

          {previewUrl && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemoveAvatar}
              disabled={uploading}
              className="gap-2 text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
              Remove Picture
            </Button>
          )}

          <p className="text-xs text-muted-foreground">
            JPG, PNG or GIF. Max 5MB.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Image Cropper Dialog */}
      {selectedImage && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          isOpen={showCropper}
        />
      )}
    </div>
  )
}
