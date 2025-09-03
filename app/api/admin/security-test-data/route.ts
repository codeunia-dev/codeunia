import { NextResponse } from 'next/server'
import { securityAnalytics } from '@/lib/security-analytics-server'

export async function POST() {
  try {
    // Generate test security data
    securityAnalytics.generateTestData(50)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Generated 50 test security events' 
    })
  } catch (error) {
    console.error('Security test data generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate security test data' },
      { status: 500 }
    )
  }
}
