import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ErrorSanitizer } from '@/lib/security/error-sanitizer';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return ErrorSanitizer.createErrorResponse(
        authError || new Error('User not authenticated'),
        401,
        'admin-check-status-auth'
      );
    }

    // Check admin status in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, first_name, last_name, username, email')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create it with default user privileges
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Profile not found, creating new profile...');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          is_admin: false // SECURITY FIX: Default to regular user, not admin
        })
        .select('is_admin, first_name, last_name, username, email')
        .single();

      if (createError) {
        return ErrorSanitizer.createErrorResponse(
          createError,
          500,
          'admin-check-status-create-profile'
        );
      }

      return NextResponse.json({
        user: {
          id: user.id,
          email: newProfile.email || user.email,
          full_name: `${newProfile.first_name || ''} ${newProfile.last_name || ''}`.trim() || newProfile.username,
          is_admin: newProfile.is_admin
        },
        message: 'Profile created successfully'
      });
    }

    if (profileError) {
      return ErrorSanitizer.createErrorResponse(
        profileError,
        404,
        'admin-check-status-profile'
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: profile.email || user.email,
        full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username,
        is_admin: profile.is_admin
      },
      message: profile.is_admin ? 'User has admin privileges' : 'User does not have admin privileges'
    });

  } catch (error) {
    return ErrorSanitizer.createErrorResponse(
      error,
      500,
      'admin-check-status-catch'
    );
  }
}

export async function POST() {
  // SECURITY FIX: Remove this endpoint entirely as it allows privilege escalation
  // Admin privileges should only be granted through proper admin workflows
  return NextResponse.json({ 
    error: 'Forbidden',
    message: 'This endpoint has been disabled for security reasons'
  }, { status: 403 });
} 