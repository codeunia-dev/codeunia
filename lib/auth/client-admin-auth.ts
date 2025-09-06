import { createClient } from '@/lib/supabase/client';

export async function getAdminAuthHeaders() {
  const supabase = createClient();
  
  // Get the current session
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    throw new Error('No valid session found');
  }

  // Return headers with the session token
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  try {
    const headers = await getAdminAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    return response;
  } catch (error) {
    console.error('Authenticated request failed:', error);
    throw error;
  }
}
