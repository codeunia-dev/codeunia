import { NextRequest, NextResponse } from 'next/server'
import { securityAnalytics } from '@/lib/security-analytics-server'

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json()
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }
    
    const resolved = securityAnalytics.resolveEvent(eventId)
    
    if (!resolved) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Event resolved successfully' 
    })
  } catch (error) {
    console.error('Security event resolution error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve security event' },
      { status: 500 }
    )
  }
}
