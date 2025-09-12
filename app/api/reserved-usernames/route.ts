import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('reserved_usernames')
      .select('*')
      .eq('is_active', true)
      .order('username');

    if (error) {
      console.error('Error fetching reserved usernames:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reserved usernames' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in reserved usernames API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
