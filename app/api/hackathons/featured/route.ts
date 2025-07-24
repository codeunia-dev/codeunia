import { NextRequest, NextResponse } from 'next/server'
import { hackathonsService } from '@/lib/services/hackathons'

// GET: Fetch featured hackathons
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 5
    
    const hackathons = await hackathonsService.getFeaturedHackathons(limit)
    
    return NextResponse.json({ hackathons })
  } catch (error) {
    console.error('Error in GET /api/hackathons/featured:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured hackathons' },
      { status: 500 }
    )
  }
} 
