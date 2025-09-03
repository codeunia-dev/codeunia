import { NextRequest, NextResponse } from 'next/server'
import { performanceAnalytics } from '@/lib/performance-analytics-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '86400000') // Default 24h
    
    const data = performanceAnalytics.getDetailedAnalytics(period)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Performance analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance analytics' },
      { status: 500 }
    )
  }
}
