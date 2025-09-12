"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  CreditCard,
  Shield,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Image from "next/image"
import { toast } from "sonner"

interface Event {
  id: number
  slug: string
  title: string
  excerpt: string
  organizer: string
  date: string
  time: string
  location: string
  capacity: number
  registered: number
  price: string
  payment: string
  image?: string
  registration_deadline?: string
}


export default function EventRegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/events/${slug}`)
        
        if (!response.ok) {
          throw new Error('Event not found')
        }
        
        const data = await response.json()
        setEvent(data.data)
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    if (!event) return

    try {
      setPaymentLoading(true)

      // Load Razorpay script
      const razorpayLoaded = await loadRazorpayScript()
      if (!razorpayLoaded) {
        throw new Error('Failed to load payment gateway')
      }

      // Create payment order
      const response = await fetch(`/api/events/${slug}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create payment order')
      }

      const orderData = await response.json()

      // Configure Razorpay options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'CodeUnia',
        description: `Registration for ${orderData.event_title}`,
        order_id: orderData.orderId,
        handler: async function (response: Record<string, unknown>) {
          try {
            setProcessing(true)
            
            // Verify payment
            const verifyResponse = await fetch(`/api/events/${slug}/payment`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            })

            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json()
              throw new Error(errorData.error || 'Payment verification failed')
            }

            await verifyResponse.json()
            toast.success('Payment successful! You are now registered for the event.')
            
            // Redirect to event page
            router.push(`/events/${slug}`)
          } catch (err) {
            console.error('Payment verification error:', err)
            toast.error(err instanceof Error ? err.message : 'Payment verification failed')
          } finally {
            setProcessing(false)
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          event_id: event.id,
          event_title: event.title,
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: function() {
            setPaymentLoading(false)
          }
        }
      }

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (err) {
      console.error('Payment error:', err)
      toast.error(err instanceof Error ? err.message : 'Payment failed')
      setPaymentLoading(false)
    }
  }

  const handleFreeRegistration = async () => {
    if (!event) return

    try {
      setProcessing(true)
      const response = await fetch(`/api/events/${slug}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Registration failed')
      }

      toast.success('Successfully registered for the event!')
      router.push(`/events/${slug}`)
    } catch (err) {
      console.error('Registration error:', err)
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setProcessing(false)
    }
  }

  const isRegistrationOpen = () => {
    if (!event) return false
    if (event.registered >= event.capacity) return false
    if (event.registration_deadline) {
      return new Date(event.registration_deadline) > new Date()
    }
    return true
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-8">{error || 'The event you are looking for does not exist.'}</p>
          <Button asChild>
            <Link href="/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Button variant="ghost" asChild>
            <Link href={`/events/${slug}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Event
            </Link>
          </Button>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Event Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <CardDescription>by {event.organizer}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.image && (
                    <div className="relative h-48 w-full rounded-lg overflow-hidden">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{event.registered}/{event.capacity} registered</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">{event.excerpt}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Registration Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Complete Registration
                  </CardTitle>
                  <CardDescription>
                    {event.payment === 'Required' || event.payment === 'Paid' 
                      ? 'Complete your payment to register for this event'
                      : 'Register for this free event'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!isRegistrationOpen() ? (
                    <div className="text-center py-8">
                      <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Registration Closed</h3>
                      <p className="text-muted-foreground">
                        {event.registered >= event.capacity 
                          ? 'This event is at full capacity.'
                          : event.registration_deadline && new Date(event.registration_deadline) <= new Date()
                          ? 'The registration deadline has passed.'
                          : 'Registration is not currently open.'
                        }
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Price Display */}
                      <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-lg border border-primary/20">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {event.payment === 'Required' || event.payment === 'Paid' ? event.price : 'Free'}
                        </div>
                        <p className="text-muted-foreground">
                          {event.payment === 'Required' || event.payment === 'Paid' 
                            ? 'per registration' 
                            : 'No payment required'
                          }
                        </p>
                      </div>

                      {/* Registration Button */}
                      <div className="space-y-4">
                        {event.payment === 'Required' || event.payment === 'Paid' ? (
                          <Button
                            onClick={handlePayment}
                            disabled={paymentLoading || processing}
                            className="w-full"
                            size="lg"
                          >
                            {paymentLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : processing ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Verifying Payment...
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Pay & Register
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={handleFreeRegistration}
                            disabled={processing}
                            className="w-full"
                            size="lg"
                          >
                            {processing ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Registering...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Register Now
                              </>
                            )}
                          </Button>
                        )}

                        {/* Security Notice */}
                        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-semibold text-green-800 dark:text-green-200 mb-1">
                              Secure Payment
                            </p>
                            <p className="text-green-700 dark:text-green-300">
                              Your payment is processed securely through Razorpay. 
                              We use industry-standard encryption to protect your data.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Registration Deadline */}
                      {event.registration_deadline && (
                        <div className="pt-4 border-t">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Registration deadline: {new Date(event.registration_deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </>
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
