import { NextRequest } from 'next/server';
import { authenticateAdmin } from '@/lib/auth/admin-auth';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { RateLimitConfigs } from '@/lib/security/rate-limiting';
import { createClient } from '@/lib/supabase/server';

export const GET = withRateLimit(
  {
    ...RateLimitConfigs.API,
    maxRequests: 20, // Limit users requests
    windowMs: 60 * 1000 // 1 minute window
  },
  async (request: NextRequest) => {
    try {
      // Authenticate admin user
      const user = await authenticateAdmin(request);
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Get real users data from database
      const supabase = await createClient();
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          username,
          email,
          is_admin,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      const users = profiles?.map(profile => ({
        id: profile.id,
        email: profile.email || '',
        username: profile.username || '',
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        role: profile.is_admin ? 'admin' : 'user',
        isActive: true,
        lastLogin: profile.updated_at,
        createdAt: profile.created_at,
        permissions: profile.is_admin ? ['read', 'write', 'delete', 'admin'] : ['read']
      })) || [];

      return new Response(
        JSON.stringify(users),
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          } 
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
);
