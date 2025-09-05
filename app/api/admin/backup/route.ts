import { NextRequest } from 'next/server';
import { backupManager } from '@/lib/database/backup-strategy';
import { authenticateAdmin } from '@/lib/auth/admin-auth';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { RateLimitConfigs } from '@/lib/security/rate-limiting';

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin user
    const user = await authenticateAdmin(request);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(request.url);
    const backupId = url.searchParams.get('id');

    if (backupId) {
      // Get specific backup details
      const backup = await backupManager.getBackupDetails(backupId);
      if (!backup) {
        return new Response(
          JSON.stringify({ error: 'Backup not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify(backup),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // Get backup list
      const backups = await backupManager.getBackupList();
      return new Response(
        JSON.stringify(backups),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
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

export const POST = withRateLimit(
  {
    ...RateLimitConfigs.SENSITIVE,
    maxRequests: 1, // Only 1 backup per hour
    windowMs: 60 * 60 * 1000 // 1 hour
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
      const action = body.action;

      if (action === 'create') {
        // Create new backup
        const result = await backupManager.createBackup();
        
        if (result.success) {
          return new Response(
            JSON.stringify({
              message: 'Backup created successfully',
              backupId: result.backupId,
              timestamp: result.timestamp,
              size: result.size,
              tables: result.tables
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({
              error: 'Backup creation failed',
              message: result.error
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } else if (action === 'restore') {
        // Restore from backup
        const backupId = body.backupId;
        if (!backupId) {
          return new Response(
            JSON.stringify({ error: 'Backup ID is required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const result = await backupManager.restoreFromBackup(backupId);
        
        if (result.success) {
          return new Response(
            JSON.stringify({
              message: 'Backup restored successfully',
              backupId
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({
              error: 'Backup restoration failed',
              message: result.error
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
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
