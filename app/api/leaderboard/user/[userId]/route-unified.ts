import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { UnifiedCache } from '@/lib/unified-cache-system';

// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabaseAdmin = getSupabaseClient();
    const userId = params.userId;

    if (!userId) {
      return UnifiedCache.createResponse(
        { error: 'User ID is required' },
        'USER_PRIVATE'
      );
    }

    const userLeaderboardData = await UnifiedCache.cachedQuery(
      `leaderboard-user-${userId}`,
      async () => {
        // Get user's points
        const { data: userPoints, error: userPointsError } = await supabaseAdmin
          .from('user_points')
          .select('total_points')
          .eq('user_id', userId)
          .single();

        if (userPointsError) {
          console.error('Error fetching user points:', userPointsError);
          return {
            rank: null,
            points: 0,
            badge: 'bronze',
            pointsToNextBadge: 100
          };
        }

        const points = userPoints?.total_points || 0;

        // Get user's rank - count how many users have more points
        const { count: usersAbove, error: rankError } = await supabaseAdmin
          .from('user_points')
          .select('*', { count: 'exact', head: true })
          .gt('total_points', points);

        if (rankError) {
          console.error('Error calculating rank:', rankError);
        }

        const rank = (usersAbove || 0) + 1;
        const badge = getBadgeForPoints(points);
        const pointsToNextBadge = getPointsToNextBadge(points);

        return {
          rank,
          points,
          badge,
          pointsToNextBadge
        };
      },
      'DATABASE_QUERIES'
    );

    return UnifiedCache.createResponse(userLeaderboardData, 'DATABASE_QUERIES');
  } catch (error) {
    console.error('Error in user leaderboard API:', error);
    return UnifiedCache.createResponse(
      { error: 'Failed to fetch user leaderboard data' },
      'USER_PRIVATE'
    );
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
  if (points < 100) return 100 - points;
  if (points < 500) return 500 - points;
  if (points < 1000) return 1000 - points;
  if (points < 2500) return 2500 - points;
  return 0; // Already at highest badge
}
