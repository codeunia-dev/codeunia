/**
 * Razorpay Webhook Handler
 * 
 * Handles Razorpay webhook events:
 * - payment.authorized
 * - payment.captured
 * - payment.failed
 * - order.paid
 * - subscription events
 */

import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


interface RazorpayWebhookPayload {
  event: string
  account_id: string
  entity: string
  contains: string[]
  created_at: number
  payload: {
    payment?: {
      entity: {
        id: string
        amount: number
        currency: string
        status: string
        order_id: string
        method: string
        captured: boolean
        description?: string
        email?: string
        contact?: string
        notes?: Record<string, unknown>
        created_at: number
      }
    }
    order?: {
      entity: {
        id: string
        amount: number
        currency: string
        status: string
        receipt?: string
        notes?: Record<string, unknown>
        created_at: number
      }
    }
  }
}

/**
 * Verify Razorpay webhook signature
 */
function verifyRazorpaySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const digest = hmac.digest('hex')
  
  // Check buffer lengths before comparison to prevent Node.js errors
  if (signature.length !== digest.length) return false
  
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

/**
 * Update payment status in database
 */
async function updatePaymentStatus(
  paymentId: string, 
  orderId: string, 
  status: 'success' | 'failed' | 'pending',
  amount?: number,
  notes?: Record<string, unknown>
) {
  try {
    const supabase = await createClient()
    
    // Update payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .upsert({
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        status,
        amount: amount ? amount / 100 : undefined, // Convert from paise to rupees
        webhook_processed_at: new Date().toISOString(),
        notes: notes || {},
      })
    
    if (paymentError) {
      console.error('Failed to update payment:', paymentError)
      return false
    }

    // If payment is successful, update related records
    if (status === 'success' && notes) {
      // Handle different payment types based on notes
      if (notes.type === 'premium_membership') {
        await updatePremiumMembership(notes.user_id as string, orderId)
      } else if (notes.type === 'internship_application') {
        await updateInternshipApplication(notes.user_id as string, notes.internship_id as string, orderId)
      } else if (notes.type === 'hackathon_registration') {
        await updateHackathonRegistration(notes.user_id as string, notes.hackathon_id as string, orderId)
      }
    }

    return true
  } catch (error) {
    console.error('Database update error:', error)
    return false
  }
}

/**
 * Update premium membership status
 */
async function updatePremiumMembership(userId: string, orderId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('user_premium_status')
    .upsert({
      user_id: userId,
      is_premium: true,
      premium_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      payment_order_id: orderId,
      activated_at: new Date().toISOString(),
    })
  
  if (error) {
    console.error('Failed to update premium status:', error)
  } else {
    console.log(`✅ Premium membership activated for user: ${userId}`)
  }
}

/**
 * Update internship application status
 */
async function updateInternshipApplication(userId: string, internshipId: string, orderId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('internship_applications')
    .update({
      payment_status: 'completed',
      payment_order_id: orderId,
      application_status: 'payment_verified',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('internship_id', internshipId)
  
  if (error) {
    console.error('Failed to update internship application:', error)
  } else {
    console.log(`✅ Internship application payment verified: ${userId} -> ${internshipId}`)
  }
}

/**
 * Update hackathon registration status
 */
async function updateHackathonRegistration(userId: string, hackathonId: string, orderId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('hackathon_registrations')
    .update({
      payment_status: 'completed',
      payment_order_id: orderId,
      registration_status: 'confirmed',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('hackathon_id', hackathonId)
  
  if (error) {
    console.error('Failed to update hackathon registration:', error)
  } else {
    console.log(`✅ Hackathon registration confirmed: ${userId} -> ${hackathonId}`)
  }
}

/**
 * Update event registration status
 */
async function updateEventRegistration(userId: string, eventId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('master_registrations')
    .update({
      payment_status: 'paid',
      status: 'registered',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('activity_type', 'event')
    .eq('activity_id', eventId)
  
  if (error) {
    console.error('Failed to update event registration:', error)
  } else {
    console.log(`✅ Event registration confirmed: ${userId} -> ${eventId}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-razorpay-signature')
    
    if (!signature) {
      return new Response('Missing signature header', { status: 400 })
    }

    const payload = await request.text()
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured')
      return new Response('Webhook secret not configured', { status: 500 })
    }

    // Verify signature
    if (!verifyRazorpaySignature(payload, signature, webhookSecret)) {
      console.error('Invalid Razorpay webhook signature')
      return new Response('Invalid signature', { status: 401 })
    }

    const data: RazorpayWebhookPayload = JSON.parse(payload)
    
    console.log(`📨 Razorpay webhook received: ${data.event}`)

    const response = {
      success: true,
      message: `Processed ${data.event} event`,
      event: data.event,
    }

    // Handle different Razorpay events
    switch (data.event) {
      case 'payment.authorized':
        // Payment has been authorized but not captured yet
        const authorizedPayment = data.payload.payment?.entity
        if (authorizedPayment) {
          console.log(`💳 Payment authorized: ${authorizedPayment.id} (₹${authorizedPayment.amount / 100})`)
          
          await updatePaymentStatus(
            authorizedPayment.id,
            authorizedPayment.order_id,
            'pending',
            authorizedPayment.amount,
            authorizedPayment.notes
          )
          
          response.message = `Payment ${authorizedPayment.id} authorized`
        }
        break

      case 'payment.captured':
        // Payment has been successfully captured
        const capturedPayment = data.payload.payment?.entity
        if (capturedPayment) {
          console.log(`✅ Payment captured: ${capturedPayment.id} (₹${capturedPayment.amount / 100})`)
          
          const success = await updatePaymentStatus(
            capturedPayment.id,
            capturedPayment.order_id,
            'success',
            capturedPayment.amount,
            capturedPayment.notes
          )
          
          response.message = `Payment ${capturedPayment.id} captured and ${success ? 'processed' : 'processing failed'}`
          
          // Send confirmation email or notification here if needed
        }
        break

      case 'payment.failed':
        // Payment has failed
        const failedPayment = data.payload.payment?.entity
        if (failedPayment) {
          console.log(`❌ Payment failed: ${failedPayment.id} (₹${failedPayment.amount / 100})`)
          
          await updatePaymentStatus(
            failedPayment.id,
            failedPayment.order_id,
            'failed',
            failedPayment.amount,
            failedPayment.notes
          )
          
          response.message = `Payment ${failedPayment.id} marked as failed`
          
          // Send failure notification if needed
        }
        break

      case 'order.paid':
        // Order has been paid (all payments for order are successful)
        const paidOrder = data.payload.order?.entity
        if (paidOrder) {
          console.log(`🎉 Order paid: ${paidOrder.id} (₹${paidOrder.amount / 100})`)
          
          // Handle different order types based on notes
          if (paidOrder.notes) {
            const notes = paidOrder.notes as Record<string, unknown>
            
            // Handle event registrations
            if (notes.event_id && notes.type === 'event_registration') {
              await updateEventRegistration(
                String(notes.user_id),
                String(notes.event_id)
              )
              response.message = `Event registration completed for order ${paidOrder.id}`
            }
            // Handle hackathon registrations
            else if (notes.hackathon_id && notes.type === 'hackathon_registration') {
              await updateHackathonRegistration(
                String(notes.user_id),
                String(notes.hackathon_id),
                paidOrder.id
              )
              response.message = `Hackathon registration completed for order ${paidOrder.id}`
            }
            // Handle internship applications
            else if (notes.internshipId && notes.type === 'internship_application') {
              await updateInternshipApplication(
                String(notes.userId),
                String(notes.internshipId),
                paidOrder.id
              )
              response.message = `Internship application completed for order ${paidOrder.id}`
            }
            else {
              response.message = `Order ${paidOrder.id} completed`
            }
          } else {
            response.message = `Order ${paidOrder.id} completed`
          }
        }
        break

      default:
        console.log(`ℹ️  Unhandled Razorpay event: ${data.event}`)
        response.message = `Event ${data.event} received but not processed`
    }

    return new Response(JSON.stringify({
      ...response,
      timestamp: new Date().toISOString(),
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })

  } catch (error) {
    console.error('❌ Razorpay webhook error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  }
}

// Health check endpoint
export async function GET() {
  return new Response(JSON.stringify({
    status: 'ok',
    service: 'razorpay-webhook',
    webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/razorpay`,
    events_supported: ['payment.authorized', 'payment.captured', 'payment.failed', 'order.paid'],
    timestamp: new Date().toISOString(),
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

// HEAD method for lightweight health checks
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'X-Webhook-Status': 'active',
      'X-Service': 'razorpay-webhook',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
