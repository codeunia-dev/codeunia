import { createClient } from '@/lib/supabase/server';

// Test script to create a dummy user for email testing
// Run this by adding it to a test API route

export async function createTestUser() {
  const supabase = await createClient();
  
  // Create a test profile
  const testProfile = {
    id: 'test-user-123', // This should match your test API calls
    full_name: 'Test User',
    email: 'test@example.com', // Change to your email to receive test emails
    username: 'testuser123',
    membership_type: 'free',
    membership_card_sent: false,
    membership_card_sent_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert([testProfile])
    .select();
    
  if (error) {
    console.error('Error creating test user:', error);
    return { success: false, error };
  }
  
  console.log('Test user created:', data);
  return { success: true, data };
}
