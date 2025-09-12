import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('views');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalViews = (data || []).reduce((sum: number, blog: Record<string, unknown>) => sum + (blog.views as number || 0), 0);
  return NextResponse.json({ totalViews });
}