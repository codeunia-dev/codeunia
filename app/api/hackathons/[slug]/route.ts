import { NextRequest, NextResponse } from 'next/server'
import { hackathonsService } from '@/lib/services/hackathons'

// GET: Fetch a single hackathon by slug
export async function GET(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl
    const slug = pathname.split('/').pop() || ''
    const hackathon = await hackathonsService.getHackathonBySlug(slug)
    
    if (!hackathon) {
      return NextResponse.json(
        { error: 'Hackathon not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(hackathon)
  } catch (error) {
    console.error('Error in GET /api/hackathons/[slug]:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hackathon' },
      { status: 500 }
    )
  }
}

// PUT: Update a hackathon
export async function PUT(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl
    const slug = pathname.split('/').pop() || ''
    const hackathonData = await request.json()
    
    const hackathon = await hackathonsService.updateHackathon(slug, hackathonData)
    
    return NextResponse.json(hackathon)
  } catch (error) {
    console.error('Error in PUT /api/hackathons/[slug]:', error)
    return NextResponse.json(
      { error: 'Failed to update hackathon' },
      { status: 500 }
    )
  }
}

// DELETE: Delete a hackathon
export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl
    const slug = pathname.split('/').pop() || ''
    await hackathonsService.deleteHackathon(slug)
    
    return NextResponse.json({ message: 'Hackathon deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/hackathons/[slug]:', error)
    return NextResponse.json(
      { error: 'Failed to delete hackathon' },
      { status: 500 }
    )
  }
} 
