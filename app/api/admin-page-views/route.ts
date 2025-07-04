import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('views');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalViews = (data || []).reduce((sum, blog) => sum + (blog.views || 0), 0);
  return NextResponse.json({ totalViews });
}