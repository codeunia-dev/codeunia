'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useCompanyContext } from '@/contexts/CompanyContext'
import { EventForm } from '@/components/dashboard/EventForm'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Event } from '@/types/events'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const { currentCompany, loading: companyLoading } = useCompanyContext()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${slug}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch event')
      }

      const data = await response.json()
      setEvent(data.event)
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('Failed to load event')
      router.push('/dashboard/company/events')
    } finally {
      setLoading(false)
    }
  }, [slug, router])

  useEffect(() => {
    if (slug) {
      fetchEvent()
    }
  }, [slug, fetchEvent])

  const handleSuccess = (updatedEvent: Event) => {
    setEvent(updatedEvent)
    toast.success('Event updated successfully!')
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      const response = await fetch(`/api/events/${slug}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      toast.success('Event deleted successfully!')
      router.push('/dashboard/company/events')
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    } finally {
      setDeleting(false)
    }
  }

  if (loading || companyLoading || !currentCompany) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Event not found</h2>
          <p className="text-muted-foreground mb-4">
            The event you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Link href="/dashboard/company/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/company/events">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
            <p className="text-muted-foreground mt-1">
              Update your event details
            </p>
          </div>
        </div>

        {/* Delete Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Event
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the event
                &quot;{event.title}&quot; and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? 'Deleting...' : 'Delete Event'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Event Form */}
      <EventForm
        company={currentCompany}
        event={event}
        mode="edit"
        onSuccess={handleSuccess}
      />
    </div>
  )
}
