'use client'

import { useRouter } from 'next/navigation'
import { useCompanyContext } from '@/contexts/CompanyContext'
import { EventForm } from '@/components/dashboard/EventForm'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CreateEventPage() {
  const router = useRouter()
  const { currentCompany, loading } = useCompanyContext()

  const handleSuccess = () => {
    // Redirect to events list after successful creation
    router.push('/dashboard/company/events')
  }

  if (loading || !currentCompany) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/company/events">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Event</h1>
          <p className="text-muted-foreground mt-1">
            Create a new event for your company
          </p>
        </div>
      </div>

      {/* Event Form */}
      <EventForm
        company={currentCompany}
        mode="create"
        onSuccess={handleSuccess}
      />
    </div>
  )
}
