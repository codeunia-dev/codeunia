'use client'

import React from 'react'
import { useCompanyContext } from '@/contexts/CompanyContext'
import { usePendingInvitationRedirect } from '@/lib/hooks/usePendingInvitationRedirect'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CompanyDashboard } from '@/components/dashboard/CompanyDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SubscriptionExpiryWarning } from '@/components/subscription/SubscriptionExpiryWarning'
import { useSubscription } from '@/hooks/useSubscription'

export default function CompanySlugDashboardPage() {
  const { currentCompany, userRole, loading, error } = useCompanyContext()
  const { usage } = useSubscription(currentCompany?.slug)
  const isPendingInvitation = usePendingInvitationRedirect()

  if (loading || isPendingInvitation) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2 text-white">No Company Found</h2>
          <p className="text-muted-foreground mb-4">
            You don&apos;t have access to any company dashboard.
          </p>
          <Button asChild>
            <Link href="/companies/register">Register Your Company</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Show verification pending message if company is not verified
  const isVerified = currentCompany.verification_status === 'verified'
  const isPending = currentCompany.verification_status === 'pending'
  const isRejected = currentCompany.verification_status === 'rejected'

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome back!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with {currentCompany.name}
          </p>
        </div>
        {userRole && ['owner', 'admin', 'editor'].includes(userRole) && (
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/dashboard/company/${currentCompany.slug}/events/create`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Subscription Expiry Warning */}
      {usage?.subscription_expires_soon && usage.days_until_expiry !== null && (
        <SubscriptionExpiryWarning
          daysUntilExpiry={usage.days_until_expiry}
          companySlug={currentCompany.slug}
          variant="banner"
        />
      )}

      {/* Verification Status Alert */}
      {!isVerified && (
        <Alert variant={isRejected ? 'destructive' : 'default'}>
          {isPending && <Clock className="h-4 w-4" />}
          {isRejected && <AlertCircle className="h-4 w-4" />}
          <AlertTitle>
            {isPending && 'Verification Pending'}
            {isRejected && 'Verification Rejected'}
          </AlertTitle>
          <AlertDescription>
            {isPending &&
              'Your company is currently under review. You can create events, but they will require approval before going live.'}
            {isRejected &&
              'Your company verification was rejected. Please contact support for more information.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Dashboard Component */}
      <CompanyDashboard company={currentCompany} />

      {/* Company Info */}
      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Company Information</CardTitle>
              <CardDescription>
                Your company profile and verification status
              </CardDescription>
            </div>
            <Badge
              variant={isVerified ? 'default' : isPending ? 'secondary' : 'destructive'}
              className="capitalize"
            >
              {isVerified && <CheckCircle className="mr-1 h-3 w-3" />}
              {isPending && <Clock className="mr-1 h-3 w-3" />}
              {isRejected && <AlertCircle className="mr-1 h-3 w-3" />}
              {currentCompany.verification_status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-zinc-400">Company Name</p>
              <p className="text-base text-white">{currentCompany.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Industry</p>
              <p className="text-base text-white capitalize">
                {currentCompany.industry || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Company Size</p>
              <p className="text-base text-white capitalize">
                {currentCompany.company_size || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Your Role</p>
              <p className="text-base text-white capitalize">
                {userRole || 'Member'}
              </p>
            </div>
          </div>
          {userRole && ['owner', 'admin'].includes(userRole) && (
            <div className="pt-4">
              <Button asChild variant="outline">
                <Link href={`/dashboard/company/${currentCompany.slug}/settings`}>
                  Edit Company Profile
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
