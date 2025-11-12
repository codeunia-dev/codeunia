'use client'

import React, { useState } from 'react'
import { useCompanyContext } from '@/contexts/CompanyContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Image as ImageIcon,
  Loader2,
  Save,
  X,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { SUBSCRIPTION_LIMITS } from '@/types/company'

export default function CompanySettingsPage() {
  const { currentCompany, userRole, loading: contextLoading, refreshCompany } = useCompanyContext()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: currentCompany?.name || '',
    legal_name: currentCompany?.legal_name || '',
    description: currentCompany?.description || '',
    website: currentCompany?.website || '',
    industry: currentCompany?.industry || '',
    company_size: currentCompany?.company_size || '',
    email: currentCompany?.email || '',
    phone: currentCompany?.phone || '',
    address: {
      street: currentCompany?.address?.street || '',
      city: currentCompany?.address?.city || '',
      state: currentCompany?.address?.state || '',
      country: currentCompany?.address?.country || '',
      zip: currentCompany?.address?.zip || '',
    },
    socials: {
      linkedin: currentCompany?.socials?.linkedin || '',
      twitter: currentCompany?.socials?.twitter || '',
      facebook: currentCompany?.socials?.facebook || '',
      instagram: currentCompany?.socials?.instagram || '',
    },
  })

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_new_registration: true,
    email_event_approved: true,
    email_event_rejected: true,
    email_team_member_joined: true,
    email_subscription_expiring: true,
  })

  // Update form data when company changes
  React.useEffect(() => {
    if (currentCompany) {
      setFormData({
        name: currentCompany.name || '',
        legal_name: currentCompany.legal_name || '',
        description: currentCompany.description || '',
        website: currentCompany.website || '',
        industry: currentCompany.industry || '',
        company_size: currentCompany.company_size || '',
        email: currentCompany.email || '',
        phone: currentCompany.phone || '',
        address: {
          street: currentCompany.address?.street || '',
          city: currentCompany.address?.city || '',
          state: currentCompany.address?.state || '',
          country: currentCompany.address?.country || '',
          zip: currentCompany.address?.zip || '',
        },
        socials: {
          linkedin: currentCompany.socials?.linkedin || '',
          twitter: currentCompany.socials?.twitter || '',
          facebook: currentCompany.socials?.facebook || '',
          instagram: currentCompany.socials?.instagram || '',
        },
      })
    }
  }, [currentCompany])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }))
  }

  const handleSocialChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socials: { ...prev.socials, [field]: value },
    }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentCompany) return

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'logo')

      const response = await fetch(`/api/companies/${currentCompany.slug}/assets`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload logo')
      }

      await refreshCompany()
      toast({
        title: 'Success',
        description: 'Logo uploaded successfully',
      })
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload logo',
        variant: 'destructive',
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentCompany) return

    setUploadingBanner(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'banner')

      const response = await fetch(`/api/companies/${currentCompany.slug}/assets`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload banner')
      }

      await refreshCompany()
      toast({
        title: 'Success',
        description: 'Banner uploaded successfully',
      })
    } catch (error) {
      console.error('Error uploading banner:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload banner',
        variant: 'destructive',
      })
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentCompany) return

    setLoading(true)
    try {
      const response = await fetch(`/api/companies/${currentCompany.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update company')
      }

      await refreshCompany()
      toast({
        title: 'Success',
        description: 'Company settings updated successfully',
      })
    } catch (error) {
      console.error('Error updating company:', error)
      toast({
        title: 'Error',
        description: 'Failed to update company settings',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (contextLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Company not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Check permissions
  const canEdit = userRole === 'owner' || userRole === 'admin'

  if (!canEdit) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don&apos;t have permission to edit company settings
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const subscriptionLimits = SUBSCRIPTION_LIMITS[currentCompany.subscription_tier]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Company Settings</h1>
        <p className="text-muted-foreground">
          Manage your company profile, branding, and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
                <CardDescription>
                  Update your company&apos;s basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-zinc-200">
                      Company Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legal_name" className="text-zinc-200">
                      Legal Name
                    </Label>
                    <Input
                      id="legal_name"
                      value={formData.legal_name}
                      onChange={(e) => handleInputChange('legal_name', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-zinc-200">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    rows={4}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="Tell us about your company..."
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-zinc-200">
                      Website *
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      required
                      className="bg-zinc-800 border-zinc-700 text-white"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-200">
                      Contact Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-zinc-200">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-zinc-200">
                      Industry *
                    </Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => handleInputChange('industry', value)}
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_size" className="text-zinc-200">
                    Company Size *
                  </Label>
                  <Select
                    value={formData.company_size}
                    onValueChange={(value) => handleInputChange('company_size', value)}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="startup">Startup (1-10)</SelectItem>
                      <SelectItem value="small">Small (11-50)</SelectItem>
                      <SelectItem value="medium">Medium (51-200)</SelectItem>
                      <SelectItem value="large">Large (201-1000)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Address</CardTitle>
                <CardDescription>Your company&apos;s physical address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-zinc-200">
                    Street Address
                  </Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-zinc-200">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-zinc-200">
                      State/Province
                    </Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-zinc-200">
                      Country
                    </Label>
                    <Input
                      id="country"
                      value={formData.address.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip" className="text-zinc-200">
                      ZIP/Postal Code
                    </Label>
                    <Input
                      id="zip"
                      value={formData.address.zip}
                      onChange={(e) => handleAddressChange('zip', e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Social Links</CardTitle>
                <CardDescription>Connect your social media profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-zinc-200">
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.socials.linkedin}
                    onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="text-zinc-200">
                    Twitter/X
                  </Label>
                  <Input
                    id="twitter"
                    type="url"
                    value={formData.socials.twitter}
                    onChange={(e) => handleSocialChange('twitter', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="text-zinc-200">
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    type="url"
                    value={formData.socials.facebook}
                    onChange={(e) => handleSocialChange('facebook', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-zinc-200">
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    type="url"
                    value={formData.socials.instagram}
                    onChange={(e) => handleSocialChange('instagram', e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="min-w-32">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Company Logo</CardTitle>
              <CardDescription>
                Upload your company logo (max 2MB, recommended 400x400px)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  {currentCompany.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentCompany.logo_url}
                      alt={currentCompany.name}
                      className="w-32 h-32 object-cover rounded-lg border-2 border-zinc-700"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-zinc-800 rounded-lg border-2 border-zinc-700 flex items-center justify-center">
                      <Building2 className="h-12 w-12 text-zinc-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                  {uploadingLogo && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                      Uploading logo...
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Company Banner</CardTitle>
              <CardDescription>
                Upload your company banner (max 5MB, recommended 1200x400px)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {currentCompany.banner_url ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentCompany.banner_url}
                      alt={`${currentCompany.name} banner`}
                      className="w-full h-48 object-cover rounded-lg border-2 border-zinc-700"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-zinc-800 rounded-lg border-2 border-zinc-700 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-zinc-600" />
                  </div>
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    disabled={uploadingBanner}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                  {uploadingBanner && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                      Uploading banner...
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Current Plan</CardTitle>
                  <CardDescription>Your subscription tier and limits</CardDescription>
                </div>
                <Badge
                  variant="default"
                  className="text-lg px-4 py-2 capitalize bg-gradient-to-r from-primary to-purple-600"
                >
                  {currentCompany.subscription_tier}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-400">
                      Events per Month
                    </span>
                    <span className="text-lg font-bold text-white">
                      {subscriptionLimits.events_per_month === null
                        ? 'Unlimited'
                        : subscriptionLimits.events_per_month}
                    </span>
                  </div>
                  <Separator className="bg-zinc-800" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-400">
                      Team Members
                    </span>
                    <span className="text-lg font-bold text-white">
                      {subscriptionLimits.team_members === null
                        ? 'Unlimited'
                        : subscriptionLimits.team_members}
                    </span>
                  </div>
                  <Separator className="bg-zinc-800" />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">Features</h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-2">
                    {subscriptionLimits.auto_approval ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-zinc-600" />
                    )}
                    <span className="text-sm text-zinc-300">Auto-approval</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {subscriptionLimits.api_access ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-zinc-600" />
                    )}
                    <span className="text-sm text-zinc-300">API Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {subscriptionLimits.custom_branding ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-zinc-600" />
                    )}
                    <span className="text-sm text-zinc-300">Custom Branding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {subscriptionLimits.priority_support ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-zinc-600" />
                    )}
                    <span className="text-sm text-zinc-300">Priority Support</span>
                  </div>
                </div>
              </div>

              {currentCompany.subscription_tier === 'free' && (
                <Alert className="bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20">
                  <AlertDescription className="text-zinc-200">
                    Upgrade to unlock more features and increase your limits.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button variant="outline" className="border-zinc-700">
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Current Usage</CardTitle>
              <CardDescription>Your current month&apos;s usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Events Created</span>
                  <span className="text-sm font-medium text-white">
                    {currentCompany.total_events}
                    {subscriptionLimits.events_per_month !== null &&
                      ` / ${subscriptionLimits.events_per_month}`}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full"
                    style={{
                      width:
                        subscriptionLimits.events_per_month === null
                          ? '0%'
                          : `${Math.min(
                              (currentCompany.total_events /
                                subscriptionLimits.events_per_month) *
                                100,
                              100
                            )}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Email Notifications</CardTitle>
              <CardDescription>
                Choose which email notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_new_registration" className="text-zinc-200">
                      New Event Registrations
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone registers for your events
                    </p>
                  </div>
                  <Switch
                    id="email_new_registration"
                    checked={notificationPrefs.email_new_registration}
                    onCheckedChange={(checked) =>
                      setNotificationPrefs((prev) => ({
                        ...prev,
                        email_new_registration: checked,
                      }))
                    }
                  />
                </div>
                <Separator className="bg-zinc-800" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_event_approved" className="text-zinc-200">
                      Event Approved
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your events are approved
                    </p>
                  </div>
                  <Switch
                    id="email_event_approved"
                    checked={notificationPrefs.email_event_approved}
                    onCheckedChange={(checked) =>
                      setNotificationPrefs((prev) => ({
                        ...prev,
                        email_event_approved: checked,
                      }))
                    }
                  />
                </div>
                <Separator className="bg-zinc-800" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_event_rejected" className="text-zinc-200">
                      Event Rejected
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your events are rejected
                    </p>
                  </div>
                  <Switch
                    id="email_event_rejected"
                    checked={notificationPrefs.email_event_rejected}
                    onCheckedChange={(checked) =>
                      setNotificationPrefs((prev) => ({
                        ...prev,
                        email_event_rejected: checked,
                      }))
                    }
                  />
                </div>
                <Separator className="bg-zinc-800" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_team_member_joined" className="text-zinc-200">
                      Team Member Joined
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when a new team member joins
                    </p>
                  </div>
                  <Switch
                    id="email_team_member_joined"
                    checked={notificationPrefs.email_team_member_joined}
                    onCheckedChange={(checked) =>
                      setNotificationPrefs((prev) => ({
                        ...prev,
                        email_team_member_joined: checked,
                      }))
                    }
                  />
                </div>
                <Separator className="bg-zinc-800" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_subscription_expiring" className="text-zinc-200">
                      Subscription Expiring
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your subscription is about to expire
                    </p>
                  </div>
                  <Switch
                    id="email_subscription_expiring"
                    checked={notificationPrefs.email_subscription_expiring}
                    onCheckedChange={(checked) =>
                      setNotificationPrefs((prev) => ({
                        ...prev,
                        email_subscription_expiring: checked,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    toast({
                      title: 'Success',
                      description: 'Notification preferences saved',
                    })
                  }}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
