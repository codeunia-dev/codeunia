import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We don't need session persistence for server-side operations
  },
});

// Type for the profiles table
export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  location?: string;
  membership_status?: 'active' | 'expired' | 'pending';
  member_type?: 'student' | 'professional' | 'alumni';
};

// Function to fetch member data by member ID (CU-XXXX format)
export async function getMemberById(memberId: string): Promise<Profile | null> {
  try {
    // Extract the numeric ID from the member ID (CU-1234 -> 1234)
    const id = memberId.startsWith('CU-') ? memberId.substring(3) : memberId;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching member data:', error);
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error('Unexpected error in getMemberById:', error);
    return null;
  }
}
