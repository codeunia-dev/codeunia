import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, AuthenticatedUser } from '@/lib/auth/admin-auth';
import { createAuditLogger } from '@/lib/services/audit-logger';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


/**
 * GET /api/admin/audit-logs/stats
 * Get audit log statistics
 */
async function getAuditStats(request: NextRequest, user: AuthenticatedUser) {
  try {
    const { searchParams } = new URL(request.url);
    const periodDays = searchParams.get('period_days') 
      ? parseInt(searchParams.get('period_days')!) 
      : 30;

    // Validate period
    if (periodDays < 1 || periodDays > 365) {
      return NextResponse.json(
        { error: 'Period must be between 1 and 365 days' },
        { status: 400 }
      );
    }

    const auditLogger = createAuditLogger();
    const stats = await auditLogger.getAuditStats(periodDays);
    
    // Log the audit stats access for security tracking
    console.log(`Admin ${user.id} accessed audit stats for ${periodDays} days`);

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        period_days: periodDays,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching audit stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit statistics' },
      { status: 500 }
    );
  }
}

// Export handler with admin authentication
export const GET = withAdminAuth(getAuditStats);
