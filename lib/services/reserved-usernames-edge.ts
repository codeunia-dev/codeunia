// Edge Runtime compatible version of reserved usernames service
// This version uses a hardcoded list for performance in middleware
// The database is still used for admin operations and management

export interface ReservedUsername {
  id: string;
  username: string;
  category: 'system' | 'admin' | 'api' | 'events' | 'learning' | 'professional' | 'content' | 'legal' | 'ecommerce' | 'discovery' | 'premium' | 'community' | 'brand' | 'common_words' | 'single_letters' | 'abbreviations' | 'error_pages';
  reason: string;
  is_active: boolean;
  created_at: string;
  created_by?: string;
  expires_at?: string;
}

export class ReservedUsernameEdgeService {
  private static instance: ReservedUsernameEdgeService;
  private cache: Map<string, ReservedUsername[]> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate: number = 0;

  public static getInstance(): ReservedUsernameEdgeService {
    if (!ReservedUsernameEdgeService.instance) {
      ReservedUsernameEdgeService.instance = new ReservedUsernameEdgeService();
    }
    return ReservedUsernameEdgeService.instance;
  }

  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheUpdate < this.cacheExpiry;
  }

  private async refreshCache(): Promise<void> {
    // For Edge Runtime, we use the hardcoded list for performance
    // The database is still used for admin operations
    this.cache.set('all', this.getFallbackReservedUsernames());
    this.lastCacheUpdate = Date.now();
  }

  public async getAllReservedUsernames(): Promise<ReservedUsername[]> {
    if (!this.isCacheValid()) {
      await this.refreshCache();
    }
    return this.cache.get('all') || [];
  }

  public async isReservedUsername(username: string): Promise<boolean> {
    try {
      const reservedUsernames = await this.getAllReservedUsernames();
      return reservedUsernames.some(ru => 
        ru.username.toLowerCase() === username.toLowerCase()
      );
    } catch {
      // Fall back to hardcoded check
      return this.isFallbackReservedUsername(username);
    }
  }

  public async getReservedUsernameReason(username: string): Promise<string | null> {
    try {
      const reservedUsernames = await this.getAllReservedUsernames();
      const reserved = reservedUsernames.find(ru => 
        ru.username.toLowerCase() === username.toLowerCase()
      );
      return reserved?.reason || null;
    } catch {
      return null;
    }
  }

  // Comprehensive hardcoded list for Edge Runtime performance
  // This should match what's in your database
  private getFallbackReservedUsernames(): ReservedUsername[] {
    const fallbackList = [
      // System & Admin
      'admin', 'root', 'superadmin', 'moderator', 'staff', 'support',
      'login', 'logout', 'signup', 'register', 'auth', 'signin', 'signup',
      'profile', 'user', 'account', 'settings', 'dashboard', 'panel',
      'home', 'welcome', 'me', 'my', 'self', 'account',

      // API & Technical
      'api', 'v1', 'v2', 'v3', 'assets', 'cdn', 'static', 'public',
      'backend', 'database', 'server', 'config', 'system', 'sys',
      'www', 'mail', 'ftp', 'smtp', 'pop', 'imap', 'email',

      // Brand & Identity
      'build', 'buildunia', 'code', 'coders', 'student', 'students',
      'hackers', 'dev', 'developer', 'creator', 'maker', 'makers',
      'codeunia', 'codeuniversity', 'university', 'college',

      // Common System Routes
      'about', 'contact', 'terms', 'privacy', 'help', 'faq',
      'blog', 'news', 'events', 'hackathons', 'tests', 'test',
      'internship', 'internships', 'jobs', 'careers', 'opportunities',
      'leaderboard', 'leaderboards', 'rankings', 'scores',
      'premium', 'pro', 'upgrade', 'subscription', 'billing',
      'join', 'collaboration', 'sponsorship', 'mentor', 'judge', 'volunteer',

      // Single letters and common words
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
      'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      'app', 'web', 'site', 'page', 'main', 'index', 'default',
      'new', 'old', 'latest', 'popular', 'trending', 'featured',
      'search', 'find', 'browse', 'explore', 'discover'
    ];

    return fallbackList.map(username => ({
      id: `fallback-${username}`,
      username,
      category: 'system' as const,
      reason: 'System reserved username',
      is_active: true,
      created_at: new Date().toISOString(),
    }));
  }

  public isFallbackReservedUsername(username: string): boolean {
    const fallbackList = this.getFallbackReservedUsernames();
    return fallbackList.some(ru => ru.username.toLowerCase() === username.toLowerCase());
  }
}

// Export singleton instance
export const reservedUsernameEdgeService = ReservedUsernameEdgeService.getInstance();
