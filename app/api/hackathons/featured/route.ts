import { NextRequest, NextResponse } from 'next/server';
import { hackathonsService, Hackathon } from '@/lib/services/hackathons';

// GET: Fetch featured hackathons
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 5;

    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 8000);
    });

    const hackathonsPromise = hackathonsService.getFeaturedHackathons(limit);

    const hackathons: Hackathon[] = await Promise.race([hackathonsPromise, timeoutPromise]);

    return NextResponse.json({ hackathons });
  } catch (error) {
    console.error('Error in GET /api/hackathons/featured:', error);
    // Return empty response instead of error
    return NextResponse.json({ hackathons: [] });
  }
}