import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth, AuthenticatedUser } from '@/lib/auth/admin-auth';
import { monitoringAlerting } from '@/lib/monitoring/alerting';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


/**
 * GET /api/admin/monitoring/alerts
 * Get monitoring alerts
 */
async function getAlerts(request: NextRequest, user: AuthenticatedUser) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'active' | 'resolved' | 'acknowledged' | null;
    const type = searchParams.get('type') as string | null;
    const severity = searchParams.get('severity') as string | null;

    let alerts = monitoringAlerting.getAlertHistory();

    // Apply filters
    if (status) {
      alerts = alerts.filter(alert => alert.status === status);
    }

    if (type) {
      alerts = alerts.filter(alert => alert.type === type);
    }

    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }

    // Sort by created_at descending
    alerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Log the monitoring alerts access for security tracking
    console.log(`Admin ${user.id} accessed monitoring alerts with filters:`, { status, type, severity });

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        total: alerts.length,
        active: monitoringAlerting.getActiveAlerts().length
      }
    });

  } catch (error) {
    console.error('Error fetching monitoring alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monitoring alerts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/monitoring/alerts
 * Acknowledge or resolve an alert
 */
async function updateAlert(request: NextRequest, user: AuthenticatedUser) {
  try {
    const body = await request.json();
    const { alert_id, action } = body;

    if (!alert_id || !action) {
      return NextResponse.json(
        { error: 'alert_id and action are required' },
        { status: 400 }
      );
    }

    if (!['acknowledge', 'resolve'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be either "acknowledge" or "resolve"' },
        { status: 400 }
      );
    }

    let success = false;
    if (action === 'acknowledge') {
      success = monitoringAlerting.acknowledgeAlert(alert_id);
    } else if (action === 'resolve') {
      success = monitoringAlerting.resolveAlert(alert_id);
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Alert not found or already processed' },
        { status: 404 }
      );
    }

    // Log the alert update for security tracking
    console.log(`Admin ${user.id} ${action}d alert ${alert_id}`);

    return NextResponse.json({
      success: true,
      message: `Alert ${action}d successfully`
    });

  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}

// Export handlers with admin authentication
export const GET = withAdminAuth(getAlerts);
export const POST = withAdminAuth(updateAlert);
