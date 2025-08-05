import { createClient } from './client';

export async function testSupabaseConnection() {
  try {
    const supabase = createClient();
    
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError);
      return { success: false, error: sessionError.message };
    }
    
    console.log('✅ Session check successful:', { hasSession: !!session });
    
    return { 
      success: true, 
      hasSession: !!session,
      session: session 
    };
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 