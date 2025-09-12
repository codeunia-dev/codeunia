import { NextResponse } from 'next/server'
import { performanceAnalytics } from '@/lib/performance-analytics-server'

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


export async function POST() {
  try {
    // Generate test performance data
    performanceAnalytics.generateTestData(75)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Generated 75 test performance metrics' 
    })
  } catch (error) {
    console.error('Performance test data generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate performance test data' },
      { status: 500 }
    )
  }
}
