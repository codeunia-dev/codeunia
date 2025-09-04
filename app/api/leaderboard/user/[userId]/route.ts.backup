import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createCacheHeaders, CACHE_CONFIGS } from '@/lib/cache-headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Cache for 2 minutes (shorter than stats since this is user-specific)
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds
const cache = new Map<string, { 
  data: {
    rank: number | null;
    points: number;
    badge: string;
    pointsToNextBadge: number;
  }; 
  timestamp: number 
}>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Check cache first
    const now = Date.now();
    const cached = cache.get(userId);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      const headers = createCacheHeaders(CACHE_CONFIGS.SHORT);
      return NextResponse.json(cached.data, {
        headers: {
          ...headers,
          'X-Cache': 'HIT'
        }
      });
    }

    // Optimized: Get user points and rank in parallel
    const [userPointsResult, rankResult] = await Promise.all([
      supabaseAdmin
        .from('user_points')
        .select('total_points')
        .eq('user_id', userId)
        .single(),
      supabaseAdmin
        .from('user_points')
        .select('total_points', { count: 'exact', head: true })
        .order('total_points', { ascending: false })
    ]);

    // Handle user points
    if (userPointsResult.error) {
      if (userPointsResult.error.code === 'PGRST116') {
        const defaultData = {
          rank: null,
          points: 0,
          badge: 'bronze',
          pointsToNextBadge: 100
        };
        
        cache.set(userId, { data: defaultData, timestamp: now });
        const headers = createCacheHeaders(CACHE_CONFIGS.SHORT);
        return NextResponse.json(defaultData, {
          headers: {
            ...headers,
            'X-Cache': 'MISS'
          }
        });
      }
      console.error('Error fetching user points:', userPointsResult.error);
      return NextResponse.json({ error: 'Failed to fetch user points' }, { status: 500 });
    }

    if (!userPointsResult.data) {
      const defaultData = {
        rank: null,
        points: 0,
        badge: 'bronze',
        pointsToNextBadge: 100
      };
      
      cache.set(userId, { data: defaultData, timestamp: now });
      const headers = createCacheHeaders(CACHE_CONFIGS.SHORT);
      return NextResponse.json(defaultData, {
        headers: {
          ...headers,
          'X-Cache': 'MISS'
        }
      });
    }

    // Calculate rank efficiently
    let rank = null;
    if (rankResult.data) {
      // Count users with more points than current user
      const { count } = await supabaseAdmin
        .from('user_points')
        .select('*', { count: 'exact', head: true })
        .gt('total_points', userPointsResult.data.total_points);
      
      rank = (count || 0) + 1;
    }

    // Calculate badge and points to next badge
    const badge = getBadgeForPoints(userPointsResult.data.total_points);
    const pointsToNextBadge = getPointsToNextBadge(userPointsResult.data.total_points);

    const responseData = {
      rank,
      points: userPointsResult.data.total_points,
      badge,
      pointsToNextBadge
    };

    // Update cache
    cache.set(userId, { data: responseData, timestamp: now });

    const headers = createCacheHeaders(CACHE_CONFIGS.SHORT);
    return NextResponse.json(responseData, {
      headers: {
        ...headers,
        'X-Cache': 'MISS'
      }
    });
  } catch (error) {
    console.error('User rank API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getBadgeForPoints(points: number): string {
  if (points >= 2500) return 'diamond';
  if (points >= 1000) return 'platinum';
  if (points >= 500) return 'gold';
  if (points >= 100) return 'silver';
  return 'bronze';
}

function getPointsToNextBadge(points: number): number {
  const badgeThresholds = [100, 500, 1000, 2500];
  const nextThreshold = badgeThresholds.find(threshold => threshold > points);
  return nextThreshold ? nextThreshold - points : 0;
} 