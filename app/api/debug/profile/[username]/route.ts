import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reservedUsernameService } from '@/lib/services/reserved-usernames';
import { profileService } from '@/lib/services/profile';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const supabase = await createClient();

    // Check if username is reserved
    const isReserved = await reservedUsernameService.isReservedUsername(username);
    const isFallbackReserved = reservedUsernameService.isFallbackReservedUsername(username);

    // Get profile data directly from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    // Get profile data using profileService
    let profileServiceResult = null;
    let profileServiceError = null;
    try {
      profileServiceResult = await profileService.getPublicProfileByUsername(username);
    } catch (error) {
      profileServiceError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test client-side Supabase client
    let clientSideResult = null;
    let clientSideError = null;
    try {
      const clientSupabase = createBrowserClient();
      const { data: clientData, error: clientError } = await clientSupabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('is_public', true)
        .single();
      
      clientSideResult = clientData;
      clientSideError = clientError?.message || null;
    } catch (error) {
      clientSideError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Get reserved username data
    const { data: reservedData, error: reservedError } = await supabase
      .from('reserved_usernames')
      .select('*')
      .eq('username', username)
      .single();

    return NextResponse.json({
      username,
      debug: {
        isReserved,
        isFallbackReserved,
        profile: profile || null,
        profileError: profileError?.message || null,
        profileServiceResult: profileServiceResult || null,
        profileServiceError: profileServiceError || null,
        clientSideResult: clientSideResult || null,
        clientSideError: clientSideError || null,
        reservedData: reservedData || null,
        reservedError: reservedError?.message || null,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 