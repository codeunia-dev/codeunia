import { NextRequest, NextResponse } from 'next/server'
import { performanceAnalytics } from '@/lib/performance-analytics-server'

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const period = parseInt(searchParams.get('period') || '86400000') // Default 24h
    
    const data = performanceAnalytics.exportMetrics(format as 'json' | 'csv', period)
    
    const contentType = format === 'csv' ? 'text/csv' : 'application/json'
    
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="performance-metrics.${format}"`
      }
    })
  } catch (error) {
    console.error('Performance analytics export error:', error)
    return NextResponse.json(
      { error: 'Failed to export performance analytics' },
      { status: 500 }
    )
  }
}
