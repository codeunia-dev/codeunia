import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


export async function POST() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const name = profile.first_name && profile.last_name 
      ? `${profile.first_name} ${profile.last_name}`
      : profile.username || user.email?.split('@')[0] || 'Member';

    // Check if user has premium status
    const isPremium = profile.is_premium && profile.premium_expires_at && 
      new Date(profile.premium_expires_at) > new Date();

    const membershipType = isPremium ? 'premium' : 'free';
    const membershipId = profile.codeunia_id || `CU-${user.id.slice(-4)}`;

    // Call the send card API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/membership/send-card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        name,
        membershipType,
        membershipId,
      }),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
