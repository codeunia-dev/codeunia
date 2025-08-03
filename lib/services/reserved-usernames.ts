import { createClient } from '@/lib/supabase/server';

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

export class ReservedUsernameService {
  private static instance: ReservedUsernameService;
  private cache: Map<string, ReservedUsername[]> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate: number = 0;

  public static getInstance(): ReservedUsernameService {
    if (!ReservedUsernameService.instance) {
      ReservedUsernameService.instance = new ReservedUsernameService();
    }
    return ReservedUsernameService.instance;
  }

  private async getSupabase() {
    return createClient();
  }

  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheUpdate < this.cacheExpiry;
  }

  private async refreshCache(): Promise<void> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from('reserved_usernames')
      .select('*')
      .eq('is_active', true)
      .order('username');

    if (error) {
      console.error('Error fetching reserved usernames:', error);
      throw error;
    }

    this.cache.set('all', data || []);
    this.lastCacheUpdate = Date.now();
  }

  public async getAllReservedUsernames(): Promise<ReservedUsername[]> {
    if (!this.isCacheValid()) {
      await this.refreshCache();
    }
    return this.cache.get('all') || [];
  }

  public async isReservedUsername(username: string): Promise<boolean> {
    const reservedUsernames = await this.getAllReservedUsernames();
    return reservedUsernames.some(ru => 
      ru.username.toLowerCase() === username.toLowerCase()
    );
  }

  public async getReservedUsernameReason(username: string): Promise<string | null> {
    const reservedUsernames = await this.getAllReservedUsernames();
    const reserved = reservedUsernames.find(ru => 
      ru.username.toLowerCase() === username.toLowerCase()
    );
    return reserved?.reason || null;
  }

  public async getReservedUsernamesByCategory(category: string): Promise<ReservedUsername[]> {
    const reservedUsernames = await this.getAllReservedUsernames();
    return reservedUsernames.filter(ru => ru.category === category);
  }

  public async addReservedUsername(
    username: string, 
    category: string, 
    reason: string, 
    createdBy?: string,
    expiresAt?: string
  ): Promise<void> {
    const supabase = await this.getSupabase();
    
    const { error } = await supabase
      .from('reserved_usernames')
      .insert([{
        username: username.toLowerCase(),
        category,
        reason,
        is_active: true,
        created_by: createdBy,
        expires_at: expiresAt
      }]);

    if (error) {
      console.error('Error adding reserved username:', error);
      throw error;
    }

    // Invalidate cache
    this.lastCacheUpdate = 0;
  }

  public async removeReservedUsername(username: string): Promise<void> {
    const supabase = await this.getSupabase();
    
    const { error } = await supabase
      .from('reserved_usernames')
      .update({ is_active: false })
      .eq('username', username.toLowerCase());

    if (error) {
      console.error('Error removing reserved username:', error);
      throw error;
    }

    // Invalidate cache
    this.lastCacheUpdate = 0;
  }

  public async updateReservedUsername(
    username: string, 
    updates: Partial<ReservedUsername>
  ): Promise<void> {
    const supabase = await this.getSupabase();
    
    const { error } = await supabase
      .from('reserved_usernames')
      .update(updates)
      .eq('username', username.toLowerCase());

    if (error) {
      console.error('Error updating reserved username:', error);
      throw error;
    }

    // Invalidate cache
    this.lastCacheUpdate = 0;
  }

  // Fallback method for when database is not available
  public getFallbackReservedUsernames(): string[] {
    return [
      // System & Admin
      'admin', 'root', 'superadmin', 'moderator', 'staff',
      'login', 'logout', 'signup', 'register', 'auth',
      'profile', 'user', 'account', 'settings', 'dashboard',
      'home', 'welcome', 'me', 'my', 'self',

      // API & Technical
      'api', 'v1', 'v2', 'v3', 'assets', 'cdn', 'static',
      'backend', 'database', 'server', 'config', 'system',
      'www', 'mail', 'ftp', 'smtp', 'pop', 'imap',

      // Brand & Identity
      'build', 'buildunia', 'code', 'coders', 'student',
      'hackers', 'dev', 'developer', 'creator', 'maker',

      // Common System Routes
      'about', 'contact', 'terms', 'privacy', 'help', 'support',
      'blog', 'news', 'events', 'hackathons', 'tests'
    ];
  }

  public isFallbackReservedUsername(username: string): boolean {
    const fallbackList = this.getFallbackReservedUsernames();
    return fallbackList.includes(username.toLowerCase());
  }
}

// Export singleton instance
export const reservedUsernameService = ReservedUsernameService.getInstance(); 