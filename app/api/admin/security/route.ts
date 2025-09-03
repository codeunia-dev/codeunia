import { NextRequest, NextResponse } from 'next/server'
import { securityAnalytics } from '@/lib/security-analytics-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '86400000') // Default 24h
    const severity = searchParams.get('severity') || 'all'
    
    const data = securityAnalytics.getDetailedAnalytics(period, severity)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Security analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security analytics' },
      { status: 500 }
    )
  }
}
