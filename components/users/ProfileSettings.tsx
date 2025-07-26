'use client'

import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Github, 
  Linkedin, 
  Twitter, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building, 
  Plus, 
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
  Eye
} from 'lucide-react'
import { ProfileUpdateData } from '@/types/profile'

// Validation rules
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  pattern?: RegExp;
}

const validationRules: Record<string, ValidationRule> = {
  first_name: { required: true, minLength: 2 },
  last_name: { required: true, minLength: 2 },
  display_name: { required: true, minLength: 3 },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { pattern: /^[\+]?[1-9][\d]{0,15}$/ },
  github_url: { pattern: /^https?:\/\/github\.com\/[a-zA-Z0-9-]+$/ },
  linkedin_url: { pattern: /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+$/ },
  twitter_url: { pattern: /^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+$/ }
}

export function ProfileSettings() {
  const { profile, loading, updating, error, updateProfile, clearError } = useProfile()
  
  const [formData, setFormData] = useState<ProfileUpdateData>({})
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Calculate profile completion percentage
  const getProfileCompletionPercentage = () => {
    const requiredFields = [
      'first_name',
      'last_name',
      'display_name',
      'bio',
      'phone',
      'github_url',
      'linkedin_url',
      'twitter_url',
      'current_position',
      'company',
      'location',
      'skills'
    ] as const;
  
    const completedFields = requiredFields.filter((field) => {
      const value = field === 'skills' ? skills : formData[field];
      if (Array.isArray(value)) return value.length > 0;
      return Boolean(value);
    });
  
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges) return
    
    setAutoSaveStatus('saving')
    try {
      const updatedData: ProfileUpdateData = {
        ...formData,
        skills: skills
      }
      await updateProfile(updatedData)
      setAutoSaveStatus('saved')
      setHasUnsavedChanges(false)
      setTimeout(() => setAutoSaveStatus('idle'), 2000)
    } catch {
      setAutoSaveStatus('error')
      setTimeout(() => setAutoSaveStatus('idle'), 3000)
    }
  }, [formData, skills, hasUnsavedChanges, updateProfile])

  // Auto-save timer
  useEffect(() => {
    if (!hasUnsavedChanges) return
    
    const timer = setTimeout(autoSave, 2000) // Auto-save after 2 seconds of inactivity
    return () => clearTimeout(timer)
  }, [formData, skills, hasUnsavedChanges, autoSave])

  // Validation function
  const validateField = (field: string, value: string): string => {
    const rules = validationRules[field]
    if (!rules) return ''

    if ('required' in rules && rules.required && !value) {
      return `${field.replace('_', ' ')} is required`
    }
    
    if ('minLength' in rules && rules.minLength && value.length < rules.minLength) {
      return `${field.replace('_', ' ')} must be at least ${rules.minLength} characters`
    }
    
    if ('pattern' in rules && rules.pattern && value && !rules.pattern.test(value)) {
      return `Please enter a valid ${field.replace('_', ' ')}`
    }
    
    return ''
  }

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        twitter_url: profile.twitter_url || '',
        current_position: profile.current_position || '',
        company: profile.company || '',
        location: profile.location || '',
        is_public: profile.is_public,
        email_notifications: profile.email_notifications
      })
      setSkills(profile.skills || [])
    }
  }, [profile])

  const handleInputChange = (field: keyof ProfileUpdateData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
    
    // Real-time validation
    const error = validateField(field, value as string)
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }))
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()])
      setNewSkill('')
      setHasUnsavedChanges(true)
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove))
    setHasUnsavedChanges(true)
  }

  const handleSaveProfile = async () => {
    const success = await updateProfile({
      ...formData,
      skills: skills
    })
    if (success) {
      setSuccessMessage('Profile updated successfully!')
      setHasUnsavedChanges(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Auto-save status */}
      {autoSaveStatus !== 'idle' && (
        <Alert variant={autoSaveStatus === 'error' ? 'destructive' : 'default'} className="mb-4">
          {autoSaveStatus === 'saving' && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Auto-saving changes...</AlertDescription>
            </>
          )}
          {autoSaveStatus === 'saved' && (
            <>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Changes saved automatically</AlertDescription>
            </>
          )}
          {autoSaveStatus === 'error' && (
            <>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Failed to auto-save. Please save manually.</AlertDescription>
            </>
          )}
        </Alert>
      )}

      {/* Manual save reminder */}
      {hasUnsavedChanges && autoSaveStatus === 'idle' && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You have unsaved changes. They will be auto-saved in a few seconds, or you can save manually.</AlertDescription>
        </Alert>
      )}

      {/* Profile Completion */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Completion
          </CardTitle>
          <CardDescription>
            Complete your profile to unlock all features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Profile Completion</span>
              <span className="font-semibold">{getProfileCompletionPercentage()}%</span>
            </div>
            <Progress value={getProfileCompletionPercentage()} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {getProfileCompletionPercentage() === 100 
                ? "Profile complete! 🎉" 
                : "Fill in more details to complete your profile"
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            {error}
            <Button variant="ghost" size="sm" onClick={clearError}>
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>Your personal information and contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="flex items-center gap-1">
                First Name
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="first_name"
                value={formData.first_name || ''}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter your first name"
                className={validationErrors.first_name ? 'border-red-500' : ''}
              />
              {validationErrors.first_name && (
                <p className="text-xs text-red-500">{validationErrors.first_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="flex items-center gap-1">
                Last Name
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="last_name"
                value={formData.last_name || ''}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter your last name"
                className={validationErrors.last_name ? 'border-red-500' : ''}
              />
              {validationErrors.last_name && (
                <p className="text-xs text-red-500">{validationErrors.last_name}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="display_name" className="flex items-center gap-1">
              Display Name
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="display_name"
              value={formData.display_name || ''}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              placeholder="How others will see your name"
              className={validationErrors.display_name ? 'border-red-500' : ''}
            />
            {validationErrors.display_name && (
              <p className="text-xs text-red-500">{validationErrors.display_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {formData.bio?.length || 0}/500 characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={validationErrors.phone ? 'border-red-500' : ''}
              />
              {validationErrors.phone && (
                <p className="text-xs text-red-500">{validationErrors.phone}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Professional Information
          </CardTitle>
          <CardDescription>Your work and career details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_position" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Current Position
              </Label>
              <Input
                id="current_position"
                value={formData.current_position || ''}
                onChange={(e) => handleInputChange('current_position', e.target.value)}
                placeholder="Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Company
              </Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Company Name"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2 border rounded-md bg-muted/50">
              {skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No skills added yet</p>
              ) : (
                skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 hover:bg-secondary/80">
                    {skill}
                    <button 
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g., React, Python)"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                className="flex-1"
              />
              <Button onClick={handleAddSkill} size="icon" disabled={!newSkill.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Social Links
          </CardTitle>
          <CardDescription>Connect your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github_url" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub
              </Label>
              <Input
                id="github_url"
                value={formData.github_url || ''}
                onChange={(e) => handleInputChange('github_url', e.target.value)}
                placeholder="https://github.com/username"
                className={validationErrors.github_url ? 'border-red-500' : ''}
              />
              {validationErrors.github_url && (
                <p className="text-xs text-red-500">{validationErrors.github_url}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Label>
              <Input
                id="linkedin_url"
                value={formData.linkedin_url || ''}
                onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className={validationErrors.linkedin_url ? 'border-red-500' : ''}
              />
              {validationErrors.linkedin_url && (
                <p className="text-xs text-red-500">{validationErrors.linkedin_url}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter_url" className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              Twitter
            </Label>
            <Input
              id="twitter_url"
              value={formData.twitter_url || ''}
              onChange={(e) => handleInputChange('twitter_url', e.target.value)}
              placeholder="https://twitter.com/username"
              className={validationErrors.twitter_url ? 'border-red-500' : ''}
            />
            {validationErrors.twitter_url && (
              <p className="text-xs text-red-500">{validationErrors.twitter_url}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>Control who can see your profile and how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="space-y-1">
              <Label className="text-base font-medium">Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to view your profile information
              </p>
            </div>
            <Switch
              checked={formData.is_public}
              onCheckedChange={(checked) => handleInputChange('is_public', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="space-y-1">
              <Label className="text-base font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications about your account
              </p>
            </div>
            <Switch
              checked={formData.email_notifications}
              onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleSaveProfile} 
              disabled={updating}
              className="flex-1"
              size="lg"
              variant={hasUnsavedChanges ? "default" : "secondary"}
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  All Changes Saved
                </>
              )}
            </Button>
            <div className="flex flex-col gap-1">
              {hasUnsavedChanges && (
                <p className="text-sm text-amber-600 dark:text-amber-400 self-center">
                  ⚡ Auto-saving in progress...
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}