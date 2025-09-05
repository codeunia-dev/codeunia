import { createClient } from '@supabase/supabase-js';
import { UnifiedCache } from '@/lib/unified-cache-system';

// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseClient();
    const stats = await UnifiedCache.cachedQuery(
      'leaderboard-stats',
      async () => {
        // Optimized query: Get all data in one go
        const { data: userPointsData, error: userPointsError } = await supabaseAdmin
          .from('user_points')
          .select('user_id, total_points')
          .order('total_points', { ascending: false });

        if (userPointsError) {
          console.error('Error fetching user points:', userPointsError);
          throw new Error('Failed to fetch user points');
        }

        if (!userPointsData || userPointsData.length === 0) {
          return {
            totalUsers: 0,
            totalPoints: 0,
            averagePoints: 0,
            topRankedUser: null
          };
        }

        // Calculate total and average points
        const totalUsers = userPointsData.length;
        const totalPoints = userPointsData.reduce((sum, user) => sum + user.total_points, 0);
        const averagePoints = Math.round(totalPoints / totalUsers);

        // Get top user details
        const topUser = userPointsData[0];
        let topRankedUser = null;

        if (topUser) {
          const { data: profileData, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('username, avatar_url, badge')
            .eq('id', topUser.user_id)
            .single();

          if (!profileError && profileData) {
            topRankedUser = {
              rank: 1,
              user_id: topUser.user_id,
              username: profileData.username,
              total_points: topUser.total_points,
              avatar_url: profileData.avatar_url,
              badge: profileData.badge || getBadgeForPoints(topUser.total_points)
            };
          }
        }

        return {
          totalUsers,
          totalPoints,
          averagePoints,
          topRankedUser
        };
      },
      'DATABASE_QUERIES'
    );

    return UnifiedCache.createResponse(stats, 'DATABASE_QUERIES');
  } catch (error) {
    console.error('Error in leaderboard stats API:', error);
    return UnifiedCache.createResponse({
      totalUsers: 0,
      totalPoints: 0,
      averagePoints: 0,
      topRankedUser: null
    }, 'USER_PRIVATE');
  }
}

function getBadgeForPoints(points: number): string | null {
  if (points >= 2500) return 'diamond';
  if (points >= 1000) return 'platinum';
  if (points >= 500) return 'gold';
  if (points >= 100) return 'silver';
  return 'bronze';
}
