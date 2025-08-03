'use client'

import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { useContributionGraph } from '@/hooks/useContributionGraph'
import { GlobalScoreCard } from '@/components/global-leaderboard/GlobalScoreCard'
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
  Briefcase, 
  Plus, 
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
  Eye
} from 'lucide-react'
import { ProfileUpdateData } from '@/types/profile'
import { UsernameField } from '@/components/UsernameField'

// Validation rules
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  pattern?: RegExp;
}

const validationRules: Record<string, ValidationRule> = {
  first_name: { required: true, minLength: 2 },
  last_name: { required: true, minLength: 2 },

  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { pattern: /^[\+]?[1-9][\d]{0,15}$/ },
  github_url: { pattern: /^https?:\/\/github\.com\/[a-zA-Z0-9-]+$/ },
 linkedin_url: {
    pattern: /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/
  },

  twitter_url: {
    pattern: /^https:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+$/
  }
}

export function ProfileSettings() {
  const { profile, loading, updating, error, updateProfile, clearError } = useProfile()
  const { logProfileUpdate } = useContributionGraph()
  
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
    if (!hasUnsavedChanges) return;

    try {
      setAutoSaveStatus('saving');
      const success = await updateProfile({
        ...formData,
        skills: skills
      });
      
      if (success) {
        setAutoSaveStatus('saved');
        setHasUnsavedChanges(false);
        // Log profile update activity
        await logProfileUpdate();
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } else {
        setAutoSaveStatus('error');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
    }
  }, [formData, skills, hasUnsavedChanges, updateProfile, logProfileUpdate]);

  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setTimeout(autoSave, 2000) // Auto-save after 2 seconds of inactivity
      return () => clearTimeout(timer)
    }
  }, [hasUnsavedChanges, autoSave])

  // Validate a single field
  const validateField = (field: string, value: string): string => {
    const rule = validationRules[field];
    if (!rule) return '';

    if (rule.required && !value) {
      return `${field.replace('_', ' ')} is required`;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return `${field.replace('_', ' ')} must be at least ${rule.minLength} characters`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return `${field.replace('_', ' ')} format is invalid`;
    }

    return '';
  };

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',

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
      // Log profile update activity
      await logProfileUpdate();
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

      {/* Global Score & Rank */}
      <GlobalScoreCard />

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



          {/* Username Field with One-Time Edit */}
          {profile && (
            <UsernameField
              key={`${profile.username}-${profile.username_editable}`}
              currentUsername={profile.username}
              usernameEditable={profile.username_editable}
              userId={profile.id}
              onUsernameChange={(newUsername) => {
                // Update local state to reflect the change
                if (profile) {
                  // Update the profile object to reflect the change
                  profile.username = newUsername
                  profile.username_editable = false
                  // Force re-render
                  setFormData(prev => ({ ...prev }))
                }
              }}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
              className={validationErrors.phone ? 'border-red-500' : ''}
            />
            {validationErrors.phone && (
              <p className="text-xs text-red-500">{validationErrors.phone}</p>
            )}
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
              <Label htmlFor="current_position">Current Position</Label>
              <Input
                id="current_position"
                value={formData.current_position || ''}
                onChange={(e) => handleInputChange('current_position', e.target.value)}
                placeholder="e.g., Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="e.g., Tech Corp"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., San Francisco, CA"
            />
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
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="github_url" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub Profile
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
              LinkedIn Profile
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

          <div className="space-y-2">
            <Label htmlFor="twitter_url" className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              Twitter/X Profile
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

      {/* Skills */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Skills & Expertise
          </CardTitle>
          <CardDescription>Add your technical skills and areas of expertise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
            />
            <Button onClick={handleAddSkill} disabled={!newSkill.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>Control your profile visibility and notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="is_public">Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to view your profile information
              </p>
            </div>
            <Switch
              id="is_public"
              checked={formData.is_public || false}
              onCheckedChange={(checked) => handleInputChange('is_public', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email_notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your account and activities
              </p>
            </div>
            <Switch
              id="email_notifications"
              checked={formData.email_notifications || false}
              onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveProfile} 
          disabled={updating || !hasUnsavedChanges}
          className="gap-2"
        >
          {updating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {updating ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}