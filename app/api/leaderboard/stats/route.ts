import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createCacheHeaders, CACHE_CONFIGS } from '@/lib/cache-headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Cache for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
let cache: {
  data: {
    totalUsers: number;
    totalPoints: number;
    averagePoints: number;
    topRankedUser: {
      rank: number;
      user_id: string;
      username: string;
      total_points: number;
      avatar_url: string | undefined;
      badge: string | null;
    } | null;
  };
  timestamp: number;
} | null = null;

export async function GET() {
  try {
    // Check cache first
    const now = Date.now();
    if (cache && (now - cache.timestamp) < CACHE_DURATION) {
      const headers = createCacheHeaders(CACHE_CONFIGS.SHORT);
      return NextResponse.json(cache.data, {
        headers: {
          ...headers,
          'X-Cache': 'HIT'
        }
      });
    }

    // Optimized query: Get all data in one go
    const { data: userPointsData, error: userPointsError } = await supabaseAdmin
      .from('user_points')
      .select('user_id, total_points')
      .order('total_points', { ascending: false });

    if (userPointsError) {
      console.error('Error fetching user points:', userPointsError);
      return NextResponse.json({
        totalUsers: 0,
        totalPoints: 0,
        averagePoints: 0,
        topRankedUser: null
      }, { status: 500 });
    }

    const totalUsers = userPointsData?.length || 0;
    const totalPoints = userPointsData?.reduce((sum, item) => sum + item.total_points, 0) || 0;
    const averagePoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;

    // Get top user profile in a single query
    let topRankedUser = null;
    if (userPointsData && userPointsData.length > 0) {
      const topUser = userPointsData[0];
      
      // Get profile for top user
      const { data: topUserProfile } = await supabaseAdmin
        .from('profiles')
        .select('username')
        .eq('id', topUser.user_id)
        .single();

      const displayName = topUserProfile?.username || `User ${topUser.user_id.substring(0, 8)}`;

      topRankedUser = {
        rank: 1,
        user_id: topUser.user_id,
        username: displayName,
        total_points: topUser.total_points,
        avatar_url: undefined,
        badge: getBadgeForPoints(topUser.total_points)
      };
    }

    const responseData = {
      totalUsers,
      totalPoints,
      averagePoints,
      topRankedUser
    };

    // Update cache
    cache = {
      data: responseData,
      timestamp: now
    };

    const headers = createCacheHeaders(CACHE_CONFIGS.SHORT);
    return NextResponse.json(responseData, {
      headers: {
        ...headers,
        'X-Cache': 'MISS'
      }
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      totalUsers: 0,
      totalPoints: 0,
      averagePoints: 0,
      topRankedUser: null
    }, { status: 500 });
  }
}

function getBadgeForPoints(points: number): string | null {
  if (points >= 2500) return 'diamond';
  if (points >= 1000) return 'platinum';
  if (points >= 500) return 'gold';
  if (points >= 100) return 'silver';
  return 'bronze';
} 