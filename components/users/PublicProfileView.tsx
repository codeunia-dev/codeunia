'use client'

import React from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ContributionGraph } from '@/components/ui/contribution-graph'
import { useContributionGraph } from '@/hooks/useContributionGraph'
import { usePublicProfileByUsername } from '@/hooks/useProfile'
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
  Loader2,
  EyeOff,
  Lock,
  MessageCircle,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface PublicProfileViewProps {
  username: string;
}

export function PublicProfileView({ username }: PublicProfileViewProps) {
  const { user } = useAuth()
  const { profile, loading, error } = usePublicProfileByUsername(username)
  
  const {
    data: activityData,
    loading: activityLoading,
    handleFilterChange,
    refresh: refreshActivity
  } = useContributionGraph()

  const isOwnProfile = user?.id === profile?.id

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="text-center p-8">
        <div className="space-y-4">
          <EyeOff className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold text-muted-foreground">Profile Not Available</h2>
          <p className="text-muted-foreground">
            This profile is private or doesn&apos;t exist.
          </p>
        </div>
      </div>
    )
  }

  const getInitials = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`
    }
    if (profile.username) {
      return profile.username.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  const getFullName = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return profile.username || 'Unknown User'
  }

  const getProfessionalTitle = () => {
    if (profile.current_position && profile.company) {
      return `${profile.current_position} at ${profile.company}`
    }
    if (profile.current_position) {
      return profile.current_position
    }
    if (profile.company) {
      return `Works at ${profile.company}`
    }
    return 'Codeunia Community Member'
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

  

  // LinkedIn-style: Show limited content for non-authenticated users
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Professional Header */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {getFullName()}
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            {getProfessionalTitle()}
          </p>
          {profile.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>

        {/* Limited Profile Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt={getFullName()} />}
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
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

        {/* Sign In Prompt Card */}
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-12">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign In to See More</h3>
            <p className="text-muted-foreground mb-4">
              Join Codeunia to see contact information, skills, and activity history.
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/auth/signin">
                <Button>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Join Codeunia
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Full profile for authenticated users
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Professional Header */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          {getFullName()}
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          {getProfessionalTitle()}
        </p>
        {profile.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{profile.location}</span>
          </div>
        )}
      </div>

      {/* Main Profile Card */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
              {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt={getFullName()} />}
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
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

      {/* Contact Information and Professional Information - Side by Side */}
      {(hasContactInfo || hasCompleteProfessionalInfo) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          {hasContactInfo && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  How to reach this person
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">{profile.phone}</p>
                      </div>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground">{profile.location}</p>
                      </div>
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
                <CardDescription>
                  Work and career details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
        </div>
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
              Connect on social platforms
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

      {/* Activity Graph - Only show if user is viewing their own profile */}
      {isOwnProfile && (
        <ContributionGraph
          data={activityData}
          loading={activityLoading}
          onFilterChange={handleFilterChange}
          onRefresh={refreshActivity}
          className="w-full"
        />
      )}

      {/* Empty State */}
      {!profile.bio && !hasContactInfo && !hasCompleteProfessionalInfo && !hasSkills && !hasSocialLinks && (
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Profile Information</h3>
            <p className="text-muted-foreground mb-4">
              This profile doesn&apos;t have much information yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}