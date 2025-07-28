'use client'

import React from 'react'
import { useProfile } from '@/hooks/useProfile'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  User, 
  MapPin, 
  Briefcase, 
  Building, 
  Phone, 
  Github, 
  Linkedin, 
  Twitter,
  Globe,
  Edit,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'

export function ProfileView() {
  const { profile, loading } = useProfile()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <div className="space-y-4">
          <User className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold text-muted-foreground">Profile not found</h2>
          <p className="text-muted-foreground">Unable to load profile information.</p>
        </div>
      </div>
    )
  }

  const getInitials = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`
    }
    if (profile.display_name) {
      return profile.display_name.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  const getFullName = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return profile.display_name || 'Unknown User'
  }

  const socialLinks = [
    {
      name: 'GitHub',
      url: profile.github_url,
      icon: Github,
      color: 'hover:text-gray-900 dark:hover:text-gray-100'
    },
    {
      name: 'LinkedIn',
      url: profile.linkedin_url,
      icon: Linkedin,
      color: 'hover:text-blue-600'
    },
    {
      name: 'Twitter',
      url: profile.twitter_url,
      icon: Twitter,
      color: 'hover:text-blue-400'
    }
  ].filter(link => link.url)

  const hasCompleteProfessionalInfo = profile.current_position && profile.company
  const hasContactInfo = profile.phone || profile.location
  const hasSocialLinks = socialLinks.length > 0
  const hasSkills = profile.skills && profile.skills.length > 0

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
            Profile Overview
          </h1>
          <p className="text-muted-foreground">
            View your profile information as others see it
          </p>
        </div>
        <Link href="/protected/profile">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Privacy Status */}
      <Card className={`border-l-4 ${profile.is_public ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            {profile.is_public ? (
              <>
                <Eye className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">Public Profile</span>
                <span className="text-muted-foreground">- Visible to others</span>
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-600">Private Profile</span>
                <span className="text-muted-foreground">- Only visible to you</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Profile Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <CardTitle className="text-2xl md:text-3xl">
                  {getFullName()}
                </CardTitle>
                {profile.display_name && profile.first_name && profile.last_name && (
                  <p className="text-muted-foreground mt-1">
                    Also known as &quot;{profile.display_name}&quot;
                  </p>
                )}
              </div>
              {hasCompleteProfessionalInfo && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{profile.current_position} at {profile.company}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        {profile.bio && (
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold">About</h3>
              <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Contact Information */}
      {hasContactInfo && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Information */}
      {hasCompleteProfessionalInfo && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.current_position && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Position</p>
                    <p className="text-muted-foreground">{profile.current_position}</p>
                  </div>
                </div>
              )}
              {profile.company && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Company</p>
                    <p className="text-muted-foreground">{profile.company}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {hasSkills && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Skills & Expertise
            </CardTitle>
            <CardDescription>
              Technical skills and areas of expertise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((skill, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Links */}
      {hasSocialLinks && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Social Links
            </CardTitle>
            <CardDescription>
              Connect with me on social platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((link) => {
                const IconComponent = link.icon
                return (
                  <Link
                    key={link.name}
                    href={link.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors ${link.color}`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!profile.bio && !hasContactInfo && !hasCompleteProfessionalInfo && !hasSkills && !hasSocialLinks && (
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
            <p className="text-muted-foreground mb-4">
              Add more information to make your profile more engaging and professional.
            </p>
            <Link href="/protected/profile">
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
