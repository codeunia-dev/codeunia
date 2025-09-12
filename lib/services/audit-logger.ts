import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export type AuditActionType = 
  | 'user_created' | 'user_updated' | 'user_deleted' | 'user_role_changed'
  | 'premium_membership_granted' | 'premium_membership_revoked' | 'premium_membership_updated'
  | 'leaderboard_updated' | 'leaderboard_reset' | 'leaderboard_cleared'
  | 'hackathon_created' | 'hackathon_updated' | 'hackathon_deleted' | 'hackathon_published'
  | 'certificate_generated' | 'certificate_sent' | 'certificate_revoked'
  | 'internship_application_updated' | 'internship_status_changed'
  | 'system_config_updated' | 'system_maintenance' | 'system_backup'
  | 'admin_login' | 'admin_logout' | 'admin_password_changed'
  | 'data_export' | 'data_import' | 'bulk_operation'
  | 'security_event' | 'suspicious_activity' | 'rate_limit_exceeded'
  | 'webhook_processed' | 'api_access' | 'admin_action';

export interface AuditLogEntry {
  admin_id: string;
  action_type: AuditActionType;
  target_resource: string;
  target_id?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

export interface AuditLogFilter {
  admin_id?: string;
  action_type?: AuditActionType;
  target_resource?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogResponse {
  logs: Array<{
    id: string;
    admin_id: string;
    action_type: AuditActionType;
    target_resource: string;
    target_id?: string;
    metadata: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    admin_name?: string;
    admin_email?: string;
  }>;
  total: number;
  has_more: boolean;
}

/**
 * Audit Logger Service
 * Handles comprehensive audit logging for admin actions and system events
 */
export class AuditLogger {
  private async getSupabaseClient() {
    return await createClient();
  }

  /**
   * Log an admin action
   */
  async logAction(
    entry: AuditLogEntry,
    request?: NextRequest
  ): Promise<{ success: boolean; log_id?: string; error?: string }> {
    try {
      // Extract IP address and user agent from request if provided
      const ip_address = request ? this.extractIPAddress(request) : entry.ip_address;
      const user_agent = request ? request.headers.get('user-agent') || undefined : entry.user_agent;

      const supabase = await this.getSupabaseClient();
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .insert({
          admin_id: entry.admin_id,
          action_type: entry.action_type,
          target_resource: entry.target_resource,
          target_id: entry.target_id,
          metadata: entry.metadata || {},
          ip_address,
          user_agent
        })
        .select('id')
        .single();

      if (error) {
        console.error('Failed to log audit action:', error);
        return { success: false, error: error.message };
      }

      return { success: true, log_id: data.id };
    } catch (error) {
      console.error('Audit logging error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get audit logs with filtering and pagination
   */
  async getLogs(filter: AuditLogFilter = {}): Promise<AuditLogResponse> {
    try {
      const supabase = await this.getSupabaseClient();
      let query = supabase
        .from('admin_audit_logs')
        .select(`
          id,
          admin_id,
          action_type,
          target_resource,
          target_id,
          metadata,
          ip_address,
          user_agent,
          created_at
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filter.admin_id) {
        query = query.eq('admin_id', filter.admin_id);
      }

      if (filter.action_type) {
        query = query.eq('action_type', filter.action_type);
      }

      if (filter.target_resource) {
        query = query.eq('target_resource', filter.target_resource);
      }

      if (filter.start_date) {
        query = query.gte('created_at', filter.start_date);
      }

      if (filter.end_date) {
        query = query.lte('created_at', filter.end_date);
      }

      // Apply pagination
      const limit = filter.limit || 50;
      const offset = filter.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Failed to fetch audit logs:', error);
        // If table doesn't exist yet, return empty results
        if (error.message.includes('relation "admin_audit_logs" does not exist') || 
            error.message.includes('Could not find a relationship')) {
          return {
            logs: [],
            total: 0,
            has_more: false
          };
        }
        throw new Error(error.message);
      }

      // Transform the data to include admin name and email
      const logs = data?.map((log: any) => ({
        id: log.id,
        admin_id: log.admin_id,
        action_type: log.action_type,
        target_resource: log.target_resource,
        target_id: log.target_id,
        metadata: log.metadata,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        created_at: log.created_at,
        admin_name: 'Admin User', // Will be populated when profiles table is available
        admin_email: 'admin@codeunia.com' // Will be populated when profiles table is available
      })) || [];

      return {
        logs,
        total: count || 0,
        has_more: (count || 0) > offset + limit
      };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(periodDays: number = 30): Promise<{
    total_actions: number;
    actions_by_type: Record<string, number>;
    actions_by_admin: Array<{ admin_id: string; admin_name: string; count: number }>;
    recent_actions: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const supabase = await this.getSupabaseClient();

      // Get total actions
      const { count: totalActions, error: totalError } = await supabase
        .from('admin_audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // If table doesn't exist yet, return empty stats
      if (totalError && (totalError.message.includes('relation "admin_audit_logs" does not exist') || 
          totalError.message.includes('Could not find a relationship'))) {
        return {
          total_actions: 0,
          actions_by_type: {},
          actions_by_admin: [],
          recent_actions: 0
        };
      }

      // Get actions by type
      const { data: actionsByType } = await supabase
        .from('admin_audit_logs')
        .select('action_type')
        .gte('created_at', startDate.toISOString());

      const actionsByTypeMap: Record<string, number> = {};
      actionsByType?.forEach((action: any) => {
        actionsByTypeMap[action.action_type] = (actionsByTypeMap[action.action_type] || 0) + 1;
      });

      // Get actions by admin
      const { data: actionsByAdmin } = await supabase
        .from('admin_audit_logs')
        .select('admin_id')
        .gte('created_at', startDate.toISOString());

      const adminCounts: Record<string, { name: string; count: number }> = {};
      actionsByAdmin?.forEach((action: any) => {
        const adminId = action.admin_id;
        const adminName = 'Admin User'; // Will be populated when profiles table is available
        
        if (!adminCounts[adminId]) {
          adminCounts[adminId] = { name: adminName, count: 0 };
        }
        adminCounts[adminId].count++;
      });

      const actionsByAdminArray = Object.entries(adminCounts).map(([adminId, data]) => ({
        admin_id: adminId,
        admin_name: data.name,
        count: data.count
      }));

      // Get recent actions (last 24 hours)
      const recentDate = new Date();
      recentDate.setHours(recentDate.getHours() - 24);

      const { count: recentActions } = await supabase
        .from('admin_audit_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', recentDate.toISOString());

      return {
        total_actions: totalActions || 0,
        actions_by_type: actionsByTypeMap,
        actions_by_admin: actionsByAdminArray,
        recent_actions: recentActions || 0
      };
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      throw error;
    }
  }

  /**
   * Extract IP address from request
   */
  private extractIPAddress(request: NextRequest): string | undefined {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const clientIP = request.headers.get('x-client-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    return realIP || clientIP || undefined;
  }

  /**
   * Log system events (for automated logging)
   */
  async logSystemEvent(
    actionType: AuditActionType,
    targetResource: string,
    metadata: Record<string, unknown> = {},
    targetId?: string
  ): Promise<{ success: boolean; log_id?: string; error?: string }> {
    // For system events, we use a special system admin ID
    const systemAdminId = '00000000-0000-0000-0000-000000000000';

    return this.logAction({
      admin_id: systemAdminId,
      action_type: actionType,
      target_resource: targetResource,
      target_id: targetId,
      metadata: {
        ...metadata,
        system_event: true,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Function to create audit logger instance
export function createAuditLogger(): AuditLogger {
  return new AuditLogger();
}

// Helper functions for common audit actions
export const auditActions = {
  /**
   * Log user management actions
   */
  async logUserAction(
    adminId: string,
    action: 'user_created' | 'user_updated' | 'user_deleted' | 'user_role_changed',
    userId: string,
    metadata: Record<string, unknown> = {},
    request?: NextRequest
  ) {
    const auditLogger = createAuditLogger();
    return auditLogger.logAction({
      admin_id: adminId,
      action_type: action,
      target_resource: `user:${userId}`,
      target_id: userId,
      metadata
    }, request);
  },

  /**
   * Log premium membership actions
   */
  async logPremiumAction(
    adminId: string,
    action: 'premium_membership_granted' | 'premium_membership_revoked' | 'premium_membership_updated',
    userId: string,
    metadata: Record<string, unknown> = {},
    request?: NextRequest
  ) {
    const auditLogger = createAuditLogger();
    return auditLogger.logAction({
      admin_id: adminId,
      action_type: action,
      target_resource: `user:${userId}`,
      target_id: userId,
      metadata
    }, request);
  },

  /**
   * Log hackathon actions
   */
  async logHackathonAction(
    adminId: string,
    action: 'hackathon_created' | 'hackathon_updated' | 'hackathon_deleted' | 'hackathon_published',
    hackathonId: string,
    metadata: Record<string, unknown> = {},
    request?: NextRequest
  ) {
    const auditLogger = createAuditLogger();
    return auditLogger.logAction({
      admin_id: adminId,
      action_type: action,
      target_resource: `hackathon:${hackathonId}`,
      target_id: hackathonId,
      metadata
    }, request);
  },

  /**
   * Log certificate actions
   */
  async logCertificateAction(
    adminId: string,
    action: 'certificate_generated' | 'certificate_sent' | 'certificate_revoked',
    certificateId: string,
    metadata: Record<string, unknown> = {},
    request?: NextRequest
  ) {
    const auditLogger = createAuditLogger();
    return auditLogger.logAction({
      admin_id: adminId,
      action_type: action,
      target_resource: `certificate:${certificateId}`,
      target_id: certificateId,
      metadata
    }, request);
  },

  /**
   * Log system events
   */
  async logSystemEvent(
    action: 'system_config_updated' | 'system_maintenance' | 'system_backup' | 'security_event',
    targetResource: string,
    metadata: Record<string, unknown> = {}
  ) {
    const auditLogger = createAuditLogger();
    return auditLogger.logSystemEvent(action, targetResource, metadata);
  }
};
