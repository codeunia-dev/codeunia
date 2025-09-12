import { NextRequest, NextResponse } from 'next/server'
import { securityAnalytics } from '@/lib/security-analytics-server'

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const period = parseInt(searchParams.get('period') || '86400000') // Default 24h
    const severity = searchParams.get('severity') || 'all'
    
    const data = securityAnalytics.exportEvents(format as 'json' | 'csv', period, severity)
    
    const contentType = format === 'csv' ? 'text/csv' : 'application/json'
    
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="security-events.${format}"`
      }
    })
  } catch (error) {
    console.error('Security analytics export error:', error)
    return NextResponse.json(
      { error: 'Failed to export security analytics' },
      { status: 500 }
    )
  }
}
