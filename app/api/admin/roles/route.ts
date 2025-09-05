import { NextRequest } from 'next/server';
import { authenticateAdmin } from '@/lib/auth/admin-auth';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { RateLimitConfigs } from '@/lib/security/rate-limiting';
import { createClient } from '@/lib/supabase/server';

export const GET = withRateLimit(
  {
    ...RateLimitConfigs.API,
    maxRequests: 20, // Limit roles requests
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

      // Get real roles data
      const supabase = await createClient();
      
      // Get user counts for each role
      const { data: adminUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('is_admin', true);

      const { data: regularUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('is_admin', false);

      const roles = [
        {
          id: 'role_admin',
          name: 'Admin',
          description: 'Full system access with all permissions',
          permissions: ['read', 'write', 'delete', 'admin', 'manage_users', 'manage_roles', 'view_logs'],
          userCount: adminUsers?.length || 0,
          isSystem: true,
          createdAt: new Date('2024-01-01').toISOString()
        },
        {
          id: 'role_user',
          name: 'User',
          description: 'Standard user with basic permissions',
          permissions: ['read'],
          userCount: regularUsers?.length || 0,
          isSystem: true,
          createdAt: new Date('2024-01-01').toISOString()
        }
      ];

      return new Response(
        JSON.stringify(roles),
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

export const POST = withRateLimit(
  {
    ...RateLimitConfigs.SENSITIVE,
    maxRequests: 5, // Limit role creation
    windowMs: 60 * 60 * 1000 // 1 hour window
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

      const body = await request.json();
      const { name, description, permissions } = body;

      // Validate input
      if (!name || !description || !Array.isArray(permissions)) {
        return new Response(
          JSON.stringify({ error: 'Invalid role data' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // In production, this would create the role in your database
      const newRole = {
        id: `role_${name.toLowerCase().replace(/\s+/g, '_')}`,
        name,
        description,
        permissions,
        userCount: 0,
        isSystem: false,
        createdAt: new Date().toISOString()
      };

      return new Response(
        JSON.stringify(newRole),
        { 
          status: 201, 
          headers: { 'Content-Type': 'application/json' } 
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
