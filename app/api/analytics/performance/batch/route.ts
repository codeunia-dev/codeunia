import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body || !Array.isArray(body.metrics)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected { metrics: [] }' },
        { status: 400 }
      )
    }

    const { metrics } = body

    // Process performance metrics
    const processedMetrics = metrics.map((metric: Record<string, unknown>) => ({
      ...metric,
      timestamp: new Date().toISOString(),
      processed: true
    }))

    // Log metrics for monitoring
    console.log(`📊 Performance metrics batch received: ${processedMetrics.length} metrics`)
    
    // In a real implementation, you would:
    // 1. Store metrics in database
    // 2. Send to external monitoring service
    // 3. Trigger alerts if thresholds exceeded
    
    return NextResponse.json({
      success: true,
      processed: processedMetrics.length,
      message: 'Performance metrics processed successfully'
    })

  } catch (error) {
    console.error('Error processing performance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to process performance metrics' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Performance analytics endpoint is active',
    methods: ['POST'],
    status: 'healthy'
  })
}
