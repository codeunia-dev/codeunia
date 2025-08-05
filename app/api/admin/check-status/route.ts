import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'User not authenticated'
      }, { status: 401 });
    }

    // Check admin status in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin, first_name, last_name, username, email')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create it
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Profile not found, creating new profile...');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          is_admin: true // Grant admin by default for now
        })
        .select('is_admin, first_name, last_name, username, email')
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return NextResponse.json({ 
          error: 'Failed to create profile',
          message: createError.message
        }, { status: 500 });
      }

              return NextResponse.json({
          user: {
            id: user.id,
            email: newProfile.email || user.email,
            full_name: `${newProfile.first_name || ''} ${newProfile.last_name || ''}`.trim() || newProfile.username,
            is_admin: newProfile.is_admin
          },
          message: 'Profile created with admin privileges'
        });
    }

    if (profileError) {
      return NextResponse.json({ 
        error: 'Profile not found',
        message: profileError.message
      }, { status: 404 });
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
    console.error('Error checking admin status:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Failed to check admin status'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'User not authenticated'
      }, { status: 401 });
    }

    // Grant admin privileges
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', user.id)
              .select('is_admin, first_name, last_name, username, email')
      .single();

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update admin status',
        message: updateError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: profile.email || user.email,
        full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username,
        is_admin: profile.is_admin
      },
      message: 'Admin privileges granted successfully'
    });

  } catch (error) {
    console.error('Error granting admin privileges:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Failed to grant admin privileges'
    }, { status: 500 });
  }
} 