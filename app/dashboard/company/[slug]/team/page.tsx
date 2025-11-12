'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { TeamManagement } from '@/components/dashboard/TeamManagement'
import { useCompanyContext } from '@/contexts/CompanyContext'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function TeamPage() {
  const params = useParams()
  const companySlug = params?.slug as string
  const { currentCompany, userRole, loading, error } = useCompanyContext()

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!currentCompany) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Company not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
        <p className="text-muted-foreground">
          Manage your team members, roles, and permissions
        </p>
      </div>

      <TeamManagement
        company={currentCompany}
        companySlug={companySlug}
        currentUserRole={userRole || 'member'}
      />
    </div>
  )
}
