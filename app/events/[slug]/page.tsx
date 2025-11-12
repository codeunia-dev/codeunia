"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  ExternalLink,
  Share2,
  Star,
  Building2
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { toast } from "sonner"
import { useRegistrationStatus } from "@/hooks/useMasterRegistrations"
import { CompanyBadge } from "@/components/companies/CompanyBadge"
import type { Company } from "@/types/company"
import { useAnalyticsTracking } from "@/hooks/useAnalyticsTracking"

interface Event {
  id: number
  slug: string
  title: string
  excerpt: string
  description: string
  organizer: string
  organizer_contact?: {
    email?: string
    phone?: string
  }
  date: string
  time: string
  duration: string
  registration_deadline?: string
  category: string
  categories: string[]
  tags: string[]
  featured: boolean
  image?: string
  location: string
  locations: string[]
  capacity: number
  registered: number
  price: string
  payment: string
  status: string
  event_type: string[]
  team_size: {
    min: number
    max: number
  }
  user_types: string[]
  rules: string[]
  schedule: Record<string, unknown>
  prize?: string
  prize_details?: string
  faq: Record<string, unknown>
  socials: Record<string, unknown>
  sponsors: Record<string, unknown>[]
  marking_scheme?: Record<string, unknown>
  // Company-related fields
  company_id?: string
  company?: Company
  created_by?: string
  approval_status?: string
  is_codeunia_event?: boolean
  views?: number
  clicks?: number
}

export default function EventPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [registering, setRegistering] = useState(false)

  const { 
    isRegistered, 
    registration, 
    loading: statusLoading, 
    refetch: refetchStatus 
  } = useRegistrationStatus('event', event?.id?.toString() || '')

  // Track analytics
  const { trackClick } = useAnalyticsTracking({
    eventSlug: slug,
    trackView: true,
  })

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/events/${slug}`)
        
        if (!response.ok) {
          throw new Error('Event not found')
        }
        
        const data = await response.json()
        setEvent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchEvent()
    }
  }, [slug])

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Event link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleRegister = async () => {
    if (!event) return

    // Track click on registration button
    trackClick()

    setRegistering(true)
    try {
      if (event.payment === 'Required' || event.payment === 'Paid') {
        // Redirect to payment page
        window.location.href = `/events/${event.slug}/register`
      } else {
        // Direct registration for free events
        const response = await fetch(`/api/events/${event.slug}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to register')
        }

        toast.success('Successfully registered for the event!')
        refetchStatus()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to register')
    } finally {
      setRegistering(false)
    }
  }

  const handleUnregister = async () => {
    if (!event) return

    setRegistering(true)
    try {
      const response = await fetch(`/api/events/${event.slug}/register`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to unregister')
      }

      toast.success('Successfully unregistered from the event')
      refetchStatus()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to unregister')
    } finally {
      setRegistering(false)
    }
  }

  const isRegistrationOpen = () => {
    if (!event) return false
    if (event.status !== 'live' && event.status !== 'published') return false
    if (event.registered >= event.capacity) return false
    if (event.registration_deadline) {
      return new Date(event.registration_deadline) > new Date()
    }
    return true
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'live':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'published':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPaymentBadge = () => {
    if (!event) return null
    
    if (event.payment === 'Required' || event.payment === 'Paid') {
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
          <DollarSign className="h-3 w-3 mr-1" />
          Paid Event - ₹{event.price}
        </Badge>
      )
    }
    
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Free Event
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Loading Event Details</h3>
              <p className="text-muted-foreground">Please wait while we fetch the event information...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="mb-6">
                <XCircle className="h-16 w-16 text-destructive mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Event Not Found</h3>
              <p className="text-muted-foreground mb-6">The event you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Link href="/events">
                <Button className="bg-primary hover:bg-primary/90">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Link href="/events">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card via-card to-card/80">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                
                <CardHeader className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className={`${getStatusColor(event.status)} font-medium`}>
                          {event.status}
                        </Badge>
                        {getPaymentBadge()}
                        {event.featured && (
                          <Badge className="bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300 font-medium">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                        {event.title}
                      </CardTitle>
                      {event.company ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Hosted by</span>
                          <CompanyBadge 
                            company={event.company} 
                            size="lg" 
                            showVerification={true}
                          />
                        </div>
                      ) : (
                        <CardDescription className="text-xl font-medium text-muted-foreground">
                          by {event.organizer}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="flex items-center gap-2 hover:bg-primary/10 transition-colors"
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Share'}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-semibold">{new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-semibold">{event.time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="p-2 rounded-full bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-semibold">{event.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Participants</p>
                        <p className="font-semibold">
                          {event.capacity > 0 ? `${event.registered}/${event.capacity}` : `${event.registered} registered`}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Hosted By Section */}
            {event.company && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-card via-card to-muted/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      Hosted By
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <CompanyBadge 
                        company={event.company} 
                        size="lg" 
                        showVerification={true}
                        showName={false}
                      />
                      <div className="flex-1">
                        <Link 
                          href={`/companies/${event.company.slug}`}
                          className="text-lg font-semibold hover:text-primary transition-colors"
                        >
                          {event.company.name}
                        </Link>
                        {event.company.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {event.company.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          {event.company.industry && (
                            <span className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {event.company.industry}
                              </Badge>
                            </span>
                          )}
                          {event.company.website && (
                            <a 
                              href={event.company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-primary transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Website
                            </a>
                          )}
                        </div>
                        <div className="mt-3">
                          <Link href={`/companies/${event.company.slug}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              View Company Profile
                              <ArrowLeft className="h-3 w-3 ml-1 rotate-180" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 rounded-full bg-primary/10">
                      <ExternalLink className="h-5 w-5 text-primary" />
                    </div>
                    About This Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 mb-6">
                      <p className="text-muted-foreground font-medium leading-relaxed">{event.excerpt}</p>
                    </div>
                    <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground">
                      <div dangerouslySetInnerHTML={{ __html: event.description }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Event Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg bg-muted/30 border border-muted/50">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        Category
                      </h4>
                      <Badge className="bg-primary/10 text-primary border-primary/20 font-medium">
                        {event.category}
                      </Badge>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/30 border border-muted/50">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        Duration
                      </h4>
                      <p className="text-muted-foreground font-medium">{event.duration}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/30 border border-muted/50">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        Event Type
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {event.event_type.map((type, index) => (
                          <Badge key={index} variant="secondary" className="font-medium">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/30 border border-muted/50">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        Target Audience
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {event.user_types.map((type, index) => (
                          <Badge key={index} variant="outline" className="font-medium">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {event.tags && event.tags.length > 0 && (
                    <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="font-medium">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="sticky top-8 border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/90">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    Registration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {statusLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
                      </div>
                    </div>
                  ) : isRegistered ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                        <div className="p-2 rounded-full bg-green-100">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-800">You&apos;re Registered!</p>
                          <p className="text-sm text-green-600">See you at the event</p>
                        </div>
                      </div>
                      {registration?.payment_status === 'paid' && (
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-800">
                              Payment Status: <span className="font-semibold">Paid</span>
                            </span>
                          </div>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        onClick={handleUnregister}
                        disabled={registering}
                        className="w-full hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      >
                        {registering ? 'Unregistering...' : 'Unregister'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {!isRegistrationOpen() ? (
                        <div className="text-center py-6">
                          <div className="p-3 rounded-full bg-red-100 w-fit mx-auto mb-4">
                            <XCircle className="h-8 w-8 text-red-500" />
                          </div>
                          <h3 className="font-semibold text-red-800 mb-2">Registration Closed</h3>
                          <p className="text-sm text-muted-foreground">
                            {event.registered >= event.capacity 
                              ? 'Event is at full capacity'
                              : event.registration_deadline && new Date(event.registration_deadline) <= new Date()
                              ? 'Registration deadline has passed'
                              : 'Registration is not available'
                            }
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-center p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                            <div className="text-3xl font-bold text-primary mb-2">
                              {event.payment === 'Required' || event.payment === 'Paid' ? `₹${event.price}` : 'Free'}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {event.payment === 'Required' || event.payment === 'Paid' ? 'per registration' : 'No cost to participate'}
                            </p>
                          </div>
                          <Button
                            onClick={handleRegister}
                            disabled={registering}
                            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                            size="lg"
                          >
                            {registering ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Processing...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                {event.payment === 'Required' || event.payment === 'Paid' ? (
                                  <>
                                    <DollarSign className="h-5 w-5" />
                                    Register & Pay
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-5 w-5" />
                                    Register Now
                                  </>
                                )}
                              </div>
                            )}
                          </Button>
                          
                          {event.payment === 'Required' || event.payment === 'Paid' ? (
                            <p className="text-xs text-center text-muted-foreground">
                              Secure payment powered by Razorpay
                            </p>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )}

                  {event.registration_deadline && (
                    <div className="pt-4 border-t border-muted">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted/30">
                        <Clock className="h-4 w-4" />
                        <span>Registration deadline: {new Date(event.registration_deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}