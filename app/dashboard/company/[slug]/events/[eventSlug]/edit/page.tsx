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
  const companySlug = params.slug as string
  const eventSlug = params.eventSlug as string
  const { currentCompany, loading: companyLoading } = useCompanyContext()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${eventSlug}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch event')
      }

      const data = await response.json()
      // API returns event directly, not wrapped in { event: ... }
      setEvent(data)
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('Failed to load event')
      router.push(`/dashboard/company/${companySlug}/events`)
    } finally {
      setLoading(false)
    }
  }, [eventSlug, companySlug, router])

  useEffect(() => {
    if (eventSlug) {
      fetchEvent()
    }
  }, [eventSlug, fetchEvent])

  const handleSuccess = (updatedEvent: Event) => {
    setEvent(updatedEvent)
    toast.success('Event updated successfully!')
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      const response = await fetch(`/api/events/${eventSlug}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      toast.success('Event deleted successfully!')
      router.push(`/dashboard/company/${companySlug}/events`)
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
          <Link href={`/dashboard/company/${companySlug}/events`}>
            <Button>Back to Events</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen dark:bg-black dark:text-white">
      <div className="space-y-6">
        {/* Back Button */}
        <Link href={`/dashboard/company/${companySlug}/events`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
          <p className="text-muted-foreground mt-1">
            Update your event details
          </p>
        </div>

        {/* Event Form */}
        <EventForm
          company={currentCompany}
          event={event}
          mode="edit"
          onSuccess={handleSuccess}
        />

        {/* Delete Button at Bottom */}
        <div className="flex items-center justify-between pt-6 border-t dark:border-gray-800">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Danger Zone</p>
            <p>Once you delete an event, there is no going back.</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
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
      </div>
    </div>
  )
}
