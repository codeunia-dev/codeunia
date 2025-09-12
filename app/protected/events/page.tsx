"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useEventRegistrations } from "@/hooks/useEventRegistrations"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"

export default function UserEventsPage() {
  const { data, loading, error, unregisterFromEvent } = useEventRegistrations()
  const [unregistering, setUnregistering] = useState<string | null>(null)

  const handleUnregister = async (eventSlug: string, eventTitle: string) => {
    try {
      setUnregistering(eventSlug)
      await unregisterFromEvent(eventSlug)
      toast.success(`Successfully unregistered from "${eventTitle}"`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to unregister from event')
    } finally {
      setUnregistering(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-300'
      case 'attended':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300'
      case 'no_show':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'registered':
        return <AlertCircle className="h-4 w-4" />
      case 'attended':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      case 'no_show':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-300'
      case 'refunded':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="flex-1 w-full flex flex-col gap-8 p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
              My Events
            </h1>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 w-full flex flex-col gap-8 p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full mb-4">
              <XCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-red-800 to-pink-800 dark:from-white dark:via-red-200 dark:to-pink-200 bg-clip-text text-transparent">
              Error Loading Events
            </h1>
            <p className="text-xl text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const registrations = data?.registrations || []

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
              My Events
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
              Track your event registrations and participation
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registrations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attended</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {registrations.filter(r => r.status === 'attended').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {registrations.filter(r => r.status === 'registered' && new Date(r.event.date) > new Date()).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        {registrations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-20">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Event Registrations
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                You haven&apos;t registered for any events yet. Explore our events and start participating!
              </p>
              <Button asChild>
                <Link href="/events">Browse Events</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {registrations.map((registration) => (
              <Card key={registration.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Event Image */}
                    <div className="w-full lg:w-48 h-32 relative rounded-lg overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                      {registration.event.image ? (
                        <Image
                          src={registration.event.image}
                          alt={registration.event.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <Calendar className="h-12 w-12 text-muted-foreground opacity-40" />
                        </div>
                      )}
                      {registration.event.featured && (
                        <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                          Featured
                        </Badge>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">
                              <Link 
                                href={`/events/${registration.event.slug}`}
                                className="hover:text-primary transition-colors"
                              >
                                {registration.event.title}
                              </Link>
                            </h3>
                            <p className="text-muted-foreground mb-3 line-clamp-2">
                              {registration.event.excerpt}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge className={getStatusColor(registration.status)}>
                              {getStatusIcon(registration.status)}
                              <span className="ml-1 capitalize">{registration.status}</span>
                            </Badge>
                            <Badge className={getPaymentStatusColor(registration.paymentStatus)}>
                              {registration.paymentStatus}
                            </Badge>
                          </div>
                        </div>

                        {/* Event Meta */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{registration.event.organizer}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(registration.event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{registration.event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{registration.event.location}</span>
                          </div>
                        </div>

                        {/* Registration Details */}
                        <div className="pt-2 border-t border-muted">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              Registered on {new Date(registration.registrationDate).toLocaleDateString()}
                            </div>
                            {registration.status === 'registered' && new Date(registration.event.date) > new Date() && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnregister(registration.event.slug, registration.event.title)}
                                disabled={unregistering === registration.event.slug}
                              >
                                {unregistering === registration.event.slug ? 'Unregistering...' : 'Unregister'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
