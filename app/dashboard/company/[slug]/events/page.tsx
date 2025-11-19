'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCompanyContext } from '@/contexts/CompanyContext'
import { usePendingInvitationRedirect } from '@/lib/hooks/usePendingInvitationRedirect'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Search, Plus, Edit, Eye, Clock, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Event } from '@/types/events'
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

export default function CompanyEventsPage() {
  const { currentCompany, userRole, loading: companyLoading } = useCompanyContext()
  const isPendingInvitation = usePendingInvitationRedirect()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingEventSlug, setDeletingEventSlug] = useState<string | null>(null)

  const canManageEvents = userRole && ['owner', 'admin', 'editor'].includes(userRole)

  const fetchEvents = useCallback(async () => {
    if (!currentCompany) return

    try {
      setLoading(true)
      // Fetch all events (not just approved) for company members
      const response = await fetch(`/api/companies/${currentCompany.slug}/events?status=all&limit=100`)

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [currentCompany])

  useEffect(() => {
    if (currentCompany) {
      fetchEvents()
    }
  }, [currentCompany, fetchEvents])

  if (companyLoading || isPendingInvitation) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteEvent = async (eventSlug: string) => {
    try {
      setDeletingEventSlug(eventSlug)

      const response = await fetch(`/api/events/${eventSlug}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      toast.success('Event deleted successfully')

      // Refresh the events list
      await fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    } finally {
      setDeletingEventSlug(null)
    }
  }

  const stats = {
    total: events.length,
    approved: events.filter(e => e.approval_status === 'approved').length,
    pending: events.filter(e => e.approval_status === 'pending').length,
    draft: events.filter(e => e.status === 'draft').length,
    totalViews: events.reduce((sum, e) => sum + (e.views || 0), 0),
    totalRegistrations: events.reduce((sum, e) => sum + (e.registered || 0), 0),
  }

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 pointer-events-none">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 pointer-events-none">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 pointer-events-none">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case 'changes_requested':
        return (
          <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 pointer-events-none">
            <AlertCircle className="h-3 w-3 mr-1" />
            Changes Requested
          </Badge>
        )
      default:
        return <Badge variant="outline" className="pointer-events-none">{status}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
      case 'published':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 pointer-events-none">Live</Badge>
      case 'draft':
        return <Badge variant="outline" className="pointer-events-none">Draft</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="text-gray-500 pointer-events-none">Cancelled</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-gray-500 pointer-events-none">Completed</Badge>
      default:
        return <Badge variant="outline" className="pointer-events-none">{status}</Badge>
    }
  }

  if (companyLoading || !currentCompany) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground mt-1">
            {canManageEvents ? "Manage your company's events and hackathons" : "View your company's events"}
          </p>
        </div>
        {canManageEvents && (
          <Link href={`/dashboard/company/${currentCompany?.slug}/events/create`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalViews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalRegistrations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Events ({filteredEvents.length})</CardTitle>
          <CardDescription>
            {canManageEvents ? 'View and manage all your events' : 'View all company events'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No events found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? 'Try adjusting your search' : canManageEvents ? 'Get started by creating your first event' : 'No events available yet'}
              </p>
              {!searchTerm && canManageEvents && (
                <Link href={`/dashboard/company/${currentCompany?.slug}/events/create`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Registered</TableHead>
                  {canManageEvents && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.slug}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{event.title}</span>
                        <span className="text-sm text-gray-500 truncate max-w-xs">
                          {event.excerpt}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.category}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                    <TableCell>{getApprovalBadge(event.approval_status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        {event.views || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.registered && event.registered > 0 ? (
                        <Link
                          href={`/dashboard/company/${currentCompany.slug}/events/${event.slug}/registrations`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
                        >
                          {event.registered}
                        </Link>
                      ) : (
                        <span className="text-gray-500">0</span>
                      )}
                    </TableCell>
                    {canManageEvents ? (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/company/${currentCompany.slug}/events/${event.slug}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {event.approval_status === 'approved' && (
                            <Link href={`/events/${event.slug}`} target="_blank">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={deletingEventSlug === event.slug}
                              >
                                {deletingEventSlug === event.slug ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{event.title}&quot;? This action cannot be undone.
                                  {event.registered && event.registered > 0 && (
                                    <span className="block mt-2 text-red-600 font-medium">
                                      Warning: This event has {event.registered} registered participant{event.registered > 1 ? 's' : ''}.
                                    </span>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteEvent(event.slug)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    ) : (
                      event.approval_status === 'approved' && (
                        <TableCell>
                          <Link href={`/events/${event.slug}`} target="_blank">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
