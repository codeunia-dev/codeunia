import { NextRequest } from 'next/server';
import { authenticateAdmin } from '@/lib/auth/admin-auth';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { RateLimitConfigs } from '@/lib/security/rate-limiting';

export const GET = withRateLimit(
  {
    ...RateLimitConfigs.API,
    maxRequests: 20, // Limit permissions requests
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

      // System permissions configuration
      const permissions = [
        // User Management
        {
          id: 'read_users',
          name: 'Read Users',
          description: 'View user information and profiles',
          category: 'User Management'
        },
        {
          id: 'write_users',
          name: 'Write Users',
          description: 'Create and update user accounts',
          category: 'User Management'
        },
        {
          id: 'delete_users',
          name: 'Delete Users',
          description: 'Remove user accounts from the system',
          category: 'User Management'
        },
        {
          id: 'manage_users',
          name: 'Manage Users',
          description: 'Full user management capabilities',
          category: 'User Management'
        },

        // Role Management
        {
          id: 'read_roles',
          name: 'Read Roles',
          description: 'View role definitions and permissions',
          category: 'Role Management'
        },
        {
          id: 'write_roles',
          name: 'Write Roles',
          description: 'Create and update roles',
          category: 'Role Management'
        },
        {
          id: 'delete_roles',
          name: 'Delete Roles',
          description: 'Remove roles from the system',
          category: 'Role Management'
        },
        {
          id: 'manage_roles',
          name: 'Manage Roles',
          description: 'Full role management capabilities',
          category: 'Role Management'
        },

        // Content Management
        {
          id: 'read_content',
          name: 'Read Content',
          description: 'View all content and posts',
          category: 'Content Management'
        },
        {
          id: 'write_content',
          name: 'Write Content',
          description: 'Create and edit content',
          category: 'Content Management'
        },
        {
          id: 'delete_content',
          name: 'Delete Content',
          description: 'Remove content and posts',
          category: 'Content Management'
        },
        {
          id: 'moderate_content',
          name: 'Moderate Content',
          description: 'Review and moderate user content',
          category: 'Content Management'
        },

        // System Administration
        {
          id: 'admin',
          name: 'System Admin',
          description: 'Full system administration access',
          category: 'System Administration'
        },
        {
          id: 'view_logs',
          name: 'View Logs',
          description: 'Access system and audit logs',
          category: 'System Administration'
        },
        {
          id: 'manage_system',
          name: 'Manage System',
          description: 'Configure system settings and parameters',
          category: 'System Administration'
        },
        {
          id: 'backup_restore',
          name: 'Backup & Restore',
          description: 'Create and restore system backups',
          category: 'System Administration'
        },

        // Analytics & Reports
        {
          id: 'view_analytics',
          name: 'View Analytics',
          description: 'Access system analytics and metrics',
          category: 'Analytics & Reports'
        },
        {
          id: 'generate_reports',
          name: 'Generate Reports',
          description: 'Create and export system reports',
          category: 'Analytics & Reports'
        },
        {
          id: 'view_statistics',
          name: 'View Statistics',
          description: 'Access user and system statistics',
          category: 'Analytics & Reports'
        },

        // Premium Features
        {
          id: 'premium_features',
          name: 'Premium Features',
          description: 'Access to premium functionality',
          category: 'Premium Features'
        },
        {
          id: 'advanced_search',
          name: 'Advanced Search',
          description: 'Use advanced search capabilities',
          category: 'Premium Features'
        },
        {
          id: 'priority_support',
          name: 'Priority Support',
          description: 'Access to priority customer support',
          category: 'Premium Features'
        }
      ];

      return new Response(
        JSON.stringify(permissions),
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
