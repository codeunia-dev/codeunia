import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, AuthenticatedUser } from '@/lib/auth/admin-auth';
import { createAuditLogger, AuditLogFilter, AuditActionType } from '@/lib/services/audit-logger';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


/**
 * GET /api/admin/audit-logs
 * Retrieve audit logs with filtering and pagination
 */
async function getAuditLogs(request: NextRequest, user: AuthenticatedUser) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filter: AuditLogFilter = {
      admin_id: searchParams.get('admin_id') || undefined,
      action_type: searchParams.get('action_type') as AuditActionType || undefined,
      target_resource: searchParams.get('target_resource') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    };

    // Validate limit
    if (filter.limit && (filter.limit < 1 || filter.limit > 100)) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Validate offset
    if (filter.offset && filter.offset < 0) {
      return NextResponse.json(
        { error: 'Offset must be non-negative' },
        { status: 400 }
      );
    }

    const auditLogger = createAuditLogger();
    const result = await auditLogger.getLogs(filter);
    
    // Log the audit log access for security tracking
    console.log(`Admin ${user.id} accessed audit logs with filter:`, filter);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/audit-logs
 * Create a new audit log entry (for manual logging)
 */
async function createAuditLog(request: NextRequest, user: AuthenticatedUser) {
  try {
    const body = await request.json();
    
    const { action_type, target_resource, target_id, metadata } = body;

    // Validate required fields
    if (!action_type || !target_resource) {
      return NextResponse.json(
        { error: 'action_type and target_resource are required' },
        { status: 400 }
      );
    }

    const auditLogger = createAuditLogger();
    const result = await auditLogger.logAction({
      admin_id: user.id,
      action_type,
      target_resource,
      target_id,
      metadata: metadata || {}
    }, request);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create audit log' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      log_id: result.log_id
    });

  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json(
      { error: 'Failed to create audit log' },
      { status: 500 }
    );
  }
}

// Export handlers with admin authentication
export const GET = withAdminAuth(getAuditLogs);
export const POST = withAdminAuth(createAuditLog);