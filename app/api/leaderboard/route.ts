import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { UnifiedCache } from '@/lib/unified-cache-system';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const timeRange = searchParams.get('timeRange') || 'all';
    const badge = searchParams.get('badge') || null;

    // Create cache key based on parameters
    const cacheKey = `leaderboard-${page}-${limit}-${timeRange}-${badge || 'all'}`;

    // Use unified cache system
    const data = await UnifiedCache.cachedQuery(
      cacheKey,
      async () => {
        return await fetchLeaderboardData(page, limit, timeRange, badge);
      },
      'API_STANDARD'
    );

    return UnifiedCache.createResponse(data, 'API_STANDARD');
    
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return UnifiedCache.createResponse(
      { entries: [], total: 0 },
      'USER_PRIVATE'
    );
  }
}

// Extract the original leaderboard logic into a separate function
async function fetchLeaderboardData(page: number, limit: number, timeRange: string, badge: string | null) {
  const supabaseAdmin = getSupabaseClient();
  // Get all user points
  const { data: allPoints, error: allPointsError } = await supabaseAdmin
    .from('user_points')
    .select('*');

  if (allPointsError) {
    console.error('Error fetching all user points:', allPointsError);
    return { entries: [], total: 0 };
  }

  // Get all profiles
  const { data: allProfiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, username');

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return { entries: [], total: 0 };
  }

  // Create a map of profiles
  const profilesMap = new Map();
  (allProfiles || []).forEach(profile => {
    profilesMap.set(profile.id, profile);
  });

  // Filter and sort users
  let filteredUsers = allPoints || [];

  // Apply time filter if needed
  if (timeRange && timeRange !== 'all') {
    const now = new Date();
    let startDate: Date;
    
    if (timeRange === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else { // month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    filteredUsers = filteredUsers.filter(user => 
      new Date(user.last_updated) >= startDate
    );
  }

  // Apply badge filter if needed
  if (badge) {
    const badgeInfo = {
      diamond: 2500,
      platinum: 1000,
      gold: 500,
      silver: 100,
      bronze: 0
    }[badge];
    
    if (badgeInfo !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.total_points >= badgeInfo);
    }
  }

  // Sort by points (descending)
  filteredUsers.sort((a, b) => b.total_points - a.total_points);

  const total = filteredUsers.length;
  const offset = (page - 1) * limit;
  const paginatedUsers = filteredUsers.slice(offset, offset + limit);

  const entries = paginatedUsers.map((item, index) => {
    const profile = profilesMap.get(item.user_id);
    const displayName = profile?.username || `User ${item.user_id.substring(0, 8)}`;
    return {
      rank: offset + index + 1,
      user_id: item.user_id,
      username: displayName,
      total_points: item.total_points,
      avatar_url: undefined,
      badge: getBadgeForPoints(item.total_points),
      last_activity: item.last_updated
    };
  });

  return { entries, total };
}

function getBadgeForPoints(points: number): string | null {
  if (points >= 2500) return 'diamond';
  if (points >= 1000) return 'platinum';
  if (points >= 500) return 'gold';
  if (points >= 100) return 'silver';
  return 'bronze';
}
