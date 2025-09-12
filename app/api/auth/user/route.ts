import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ 
        authenticated: false, 
        user: null,
        error: error?.message || 'No user found'
      }, { status: 401 });
    }

    return NextResponse.json({ 
      authenticated: true, 
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json({ 
      authenticated: false, 
      user: null,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 