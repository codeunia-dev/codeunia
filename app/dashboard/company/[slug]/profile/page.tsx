'use client'

import React, { useState, useEffect } from 'react'
import { useCompanyContext } from '@/contexts/CompanyContext'
import { usePendingInvitationRedirect } from '@/lib/hooks/usePendingInvitationRedirect'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  User,
  Building2,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  bio: string | null
  current_position: string | null
  company: string | null
  location: string | null
  github_url: string | null
  linkedin_url: string | null
  twitter_url: string | null
  avatar_url: string | null
}

export default function CompanyProfilePage() {
  const { currentCompany, userRole, loading: contextLoading } = useCompanyContext()
  const isPendingInvitation = usePendingInvitationRedirect()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  })

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to view this page',
          variant: 'destructive',
        })
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile(data)
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
      })
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }



  if (contextLoading || isPendingInvitation || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Profile not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">My Profile</h1>
        <p className="text-muted-foreground">
          View your personal information and company details
        </p>
      </div>

      {/* Personal Information - Read Only */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5 text-purple-400" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Your profile details (read-only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-zinc-200">First Name</Label>
              <Input
                value={formData.first_name}
                disabled
                className="bg-zinc-800 border-zinc-700 text-zinc-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-200">Last Name</Label>
              <Input
                value={formData.last_name}
                disabled
                className="bg-zinc-800 border-zinc-700 text-zinc-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-200 flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-400" />
              Email
            </Label>
            <Input
              type="email"
              value={profile.email}
              disabled
              className="bg-zinc-800 border-zinc-700 text-zinc-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-200 flex items-center gap-2">
              <Phone className="h-4 w-4 text-purple-400" />
              Phone Number
            </Label>
            <Input
              type="tel"
              value={formData.phone || 'Not provided'}
              disabled
              className="bg-zinc-800 border-zinc-700 text-zinc-400"
            />
          </div>

          {currentCompany && (
            <>
              <Separator className="bg-zinc-800 my-4" />
              
              <div className="space-y-3">
                <Label className="text-zinc-200 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-400" />
                  Company Context
                </Label>
                
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <span className="text-zinc-400 text-sm">Company</span>
                  <span className="text-white font-medium">{currentCompany.name}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <span className="text-zinc-400 text-sm">Your Role</span>
                  <Badge variant="secondary" className="capitalize bg-purple-600/20 text-purple-300 border-purple-600/30">
                    {userRole}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Alert className="bg-zinc-900 border-zinc-800">
        <AlertCircle className="h-4 w-4 text-purple-400" />
        <AlertDescription className="text-zinc-300">
          Profile information is currently read-only. To update your details, please contact your administrator or support team.
        </AlertDescription>
      </Alert>
    </div>
  )
}
