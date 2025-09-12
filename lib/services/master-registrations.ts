import { createClient } from '@supabase/supabase-js';

// Types for master registration system
export interface MasterRegistration {
  id: number;
  user_id: string;
  activity_type: 'hackathon' | 'event' | 'internship' | 'test' | 'round' | 'volunteer' | 'sponsorship' | 'mentor' | 'judge' | 'collaboration';
  activity_id: string;
  registration_date: string;
  status: 'registered' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed' | 'attended' | 'no_show' | 'disqualified';
  payment_status: 'not_applicable' | 'pending' | 'paid' | 'failed' | 'refunded';
  payment_amount?: number;
  payment_currency?: string;
  payment_id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  institution?: string;
  department?: string;
  year_of_study?: string;
  experience_level?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RegistrationRequest {
  activity_type: MasterRegistration['activity_type'];
  activity_id: string;
  status?: MasterRegistration['status'];
  payment_status?: MasterRegistration['payment_status'];
  payment_amount?: number;
  payment_currency?: string;
  payment_id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  institution?: string;
  department?: string;
  year_of_study?: string;
  experience_level?: string;
  metadata?: Record<string, unknown>;
}

export interface RegistrationFilters {
  user_id?: string;
  activity_type?: MasterRegistration['activity_type'];
  activity_id?: string;
  status?: MasterRegistration['status'];
  payment_status?: MasterRegistration['payment_status'];
  limit?: number;
  offset?: number;
}

class MasterRegistrationsService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // Register for any activity type with optimized query
  async register(request: RegistrationRequest, userId: string): Promise<MasterRegistration> {
    // Use a single transaction to insert registration and get user profile data
    const { data, error } = await this.supabase
      .from('master_registrations')
      .insert({
        user_id: userId,
        activity_type: request.activity_type,
        activity_id: request.activity_id,
        registration_date: new Date().toISOString(),
        status: request.status || 'registered',
        payment_status: request.payment_status || 'not_applicable',
        payment_amount: request.payment_amount,
        payment_currency: request.payment_currency,
        payment_id: request.payment_id,
        full_name: request.full_name,
        email: request.email,
        phone: request.phone,
        institution: request.institution,
        department: request.department,
        year_of_study: request.year_of_study,
        experience_level: request.experience_level,
        metadata: request.metadata || {}
      })
      .select(`
        *,
        profiles!inner(
          first_name,
          last_name,
          email,
          phone,
          company,
          current_position
        )
      `)
      .single();

    if (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }

    return data;
  }

  // Get user's registrations with filters and optimized joins
  async getUserRegistrations(filters: RegistrationFilters): Promise<MasterRegistration[]> {
    let query = this.supabase
      .from('master_registrations')
      .select(`
        *,
        profiles!inner(
          first_name,
          last_name,
          email,
          phone,
          company,
          current_position
        )
      `)
      .order('created_at', { ascending: false });

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters.activity_type) {
      query = query.eq('activity_type', filters.activity_type);
    }

    if (filters.activity_id) {
      query = query.eq('activity_id', filters.activity_id);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.payment_status) {
      query = query.eq('payment_status', filters.payment_status);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch registrations: ${error.message}`);
    }

    return data || [];
  }

  // Check if user is registered for a specific activity
  async isRegistered(userId: string, activityType: string, activityId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('master_registrations')
      .select('id')
      .eq('user_id', userId)
      .eq('activity_type', activityType)
      .eq('activity_id', activityId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check registration: ${error.message}`);
    }

    return !!data;
  }

  // Update registration status
  async updateRegistration(
    userId: string,
    activityType: string,
    activityId: string,
    updates: Partial<RegistrationRequest>
  ): Promise<MasterRegistration> {
    const { data, error } = await this.supabase
      .from('master_registrations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('activity_type', activityType)
      .eq('activity_id', activityId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update registration: ${error.message}`);
    }

    return data;
  }

  // Cancel/unregister from an activity
  async unregister(userId: string, activityType: string, activityId: string): Promise<void> {
    const { error } = await this.supabase
      .from('master_registrations')
      .delete()
      .eq('user_id', userId)
      .eq('activity_type', activityType)
      .eq('activity_id', activityId);

    if (error) {
      throw new Error(`Failed to unregister: ${error.message}`);
    }
  }

  // Get registration statistics
  async getRegistrationStats(activityType?: string): Promise<{
    total: number;
    by_status: Record<string, number>;
    by_payment_status: Record<string, number>;
    by_activity_type: Record<string, number>;
  }> {
    let query = this.supabase
      .from('master_registrations')
      .select('status, payment_status, activity_type');

    if (activityType) {
      query = query.eq('activity_type', activityType);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }

    const stats = {
      total: data?.length || 0,
      by_status: {} as Record<string, number>,
      by_payment_status: {} as Record<string, number>,
      by_activity_type: {} as Record<string, number>
    };

    data?.forEach(registration => {
      // Count by status
      stats.by_status[registration.status] = (stats.by_status[registration.status] || 0) + 1;
      
      // Count by payment status
      stats.by_payment_status[registration.payment_status] = (stats.by_payment_status[registration.payment_status] || 0) + 1;
      
      // Count by activity type
      stats.by_activity_type[registration.activity_type] = (stats.by_activity_type[registration.activity_type] || 0) + 1;
    });

    return stats;
  }

  // Get activity details with registration info
  async getActivityWithRegistration(
    activityType: string,
    activityId: string,
    userId?: string
  ): Promise<{
    activity: Record<string, unknown>;
    registration?: MasterRegistration;
    is_registered: boolean;
    total_registrations: number;
  }> {
    // Get activity details based on type
    let tableName;

    switch (activityType) {
      case 'hackathon':
        tableName = 'hackathons';
        break;
      case 'event':
        tableName = 'events';
        break;
      case 'test':
        tableName = 'tests';
        break;
      case 'internship':
        tableName = 'internships';
        break;
      default:
        throw new Error(`Unsupported activity type: ${activityType}`);
    }

    const { data: activity, error: activityError } = await this.supabase
      .from(tableName)
      .select('*')
      .eq('id', activityId)
      .single();

    if (activityError) {
      throw new Error(`Activity not found: ${activityError.message}`);
    }

    // Get user's registration if userId provided
    let registration: MasterRegistration | undefined;
    let is_registered = false;

    if (userId) {
      const { data: regData } = await this.supabase
        .from('master_registrations')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', activityType)
        .eq('activity_id', activityId)
        .single();

      if (regData) {
        registration = regData;
        is_registered = true;
      }
    }

    // Get total registrations for this activity
    const { count: total_registrations } = await this.supabase
      .from('master_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('activity_type', activityType)
      .eq('activity_id', activityId);

    return {
      activity,
      registration,
      is_registered,
      total_registrations: total_registrations || 0
    };
  }
}

export const masterRegistrationsService = new MasterRegistrationsService();
