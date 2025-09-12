import { useState, useEffect } from 'react';

// Types
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
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  activity?: any;
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
  metadata?: Record<string, any>;
}

export interface RegistrationFilters {
  activity_type?: MasterRegistration['activity_type'];
  activity_id?: string;
  status?: MasterRegistration['status'];
  payment_status?: MasterRegistration['payment_status'];
  limit?: number;
  offset?: number;
}

// Hook for managing master registrations
export function useMasterRegistrations(filters?: RegistrationFilters) {
  const [registrations, setRegistrations] = useState<MasterRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.activity_type) params.append('activity_type', filters.activity_type);
      if (filters?.activity_id) params.append('activity_id', filters.activity_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.payment_status) params.append('payment_status', filters.payment_status);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/registrations?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }

      const data = await response.json();
      setRegistrations(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [filters?.activity_type, filters?.activity_id, filters?.status, filters?.payment_status]);

  const register = async (request: RegistrationRequest): Promise<MasterRegistration> => {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    const data = await response.json();
    
    // Refresh registrations
    await fetchRegistrations();
    
    return data.data;
  };

  const unregister = async (activityType: string, activityId: string): Promise<void> => {
    const response = await fetch(`/api/registrations/${activityType}/${activityId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Unregistration failed');
    }

    // Refresh registrations
    await fetchRegistrations();
  };

  const updateRegistration = async (
    activityType: string,
    activityId: string,
    updates: Partial<RegistrationRequest>
  ): Promise<MasterRegistration> => {
    const response = await fetch(`/api/registrations/${activityType}/${activityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Update failed');
    }

    const data = await response.json();
    
    // Refresh registrations
    await fetchRegistrations();
    
    return data.data;
  };

  const isRegistered = (activityType: string, activityId: string): boolean => {
    return registrations.some(
      reg => reg.activity_type === activityType && reg.activity_id === activityId
    );
  };

  const getRegistration = (activityType: string, activityId: string): MasterRegistration | undefined => {
    return registrations.find(
      reg => reg.activity_type === activityType && reg.activity_id === activityId
    );
  };

  return {
    registrations,
    loading,
    error,
    register,
    unregister,
    updateRegistration,
    isRegistered,
    getRegistration,
    refetch: fetchRegistrations
  };
}

// Hook for user's all registrations dashboard
export function useUserRegistrations() {
  const [data, setData] = useState<{
    registrations: MasterRegistration[];
    grouped: Record<string, MasterRegistration[]>;
    stats: {
      total: number;
      byActivityType: Record<string, number>;
      byStatus: Record<string, number>;
      byPaymentStatus: Record<string, number>;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/registrations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user registrations');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRegistrations();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchUserRegistrations
  };
}

// Hook for checking registration status
export function useRegistrationStatus(activityType: string, activityId: string) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<MasterRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/registrations/${activityType}/${activityId}`);
      
      if (!response.ok) {
        throw new Error('Failed to check registration status');
      }

      const result = await response.json();
      setIsRegistered(result.data.is_registered);
      setRegistration(result.data.registration || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activityType && activityId) {
      checkStatus();
    }
  }, [activityType, activityId]);

  return {
    isRegistered,
    registration,
    loading,
    error,
    refetch: checkStatus
  };
}
