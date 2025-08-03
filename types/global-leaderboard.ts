// Global Leaderboard System Types

export interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  rank: number;
  last_updated: string;
  created_at: string;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  related_id?: string; // test_id, blog_id, etc.
  points_awarded: number;
  created_at: string;
}

export type ActivityType = 
  | 'daily_login'
  | 'test_registration'
  | 'test_completion'
  | 'hackathon_registration'
  | 'hackathon_participation'
  | 'blog_read'
  | 'blog_like'
  | 'blog_share'
  | 'profile_update'
  | 'certificate_earned'
  | 'top_3_rank'
  | 'user_referral'

export interface PointSystem {
  daily_login: number;
  test_registration: number;
  test_completion: number;
  hackathon_registration: number;
  hackathon_participation: number;
  blog_read: number;
  blog_like: number;
  blog_share: number;
  profile_update: number;
  certificate_earned: number;
  top_3_rank: number;
  user_referral: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  total_points: number;
  avatar_url?: string;
  badge?: BadgeType | null;
  last_activity?: string;
}

export type BadgeType = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface BadgeInfo {
  type: BadgeType;
  name: string;
  description: string;
  minPoints: number;
  color: string;
  icon: string;
}

export interface GlobalLeaderboardStats {
  totalUsers: number;
  totalPoints: number;
  averagePoints: number;
  topRankedUser: LeaderboardEntry | null;
  userRank: number | null;
  userPoints: number;
  userBadge: BadgeType | null;
  pointsToNextBadge: number;
}

export interface LeaderboardFilters {
  timeRange: 'all' | 'month' | 'week';
  badge?: BadgeType;
  search?: string;
}

// API Response types
export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
  userRank: number | null;
  userPoints: number;
}

export interface PointsResponse {
  points: number;
  rank: number;
  badge: BadgeType | null;
  pointsToNextBadge: number;
}

export interface ActivityLogResponse {
  activities: UserActivityLog[];
  total: number;
  page: number;
  limit: number;
} 