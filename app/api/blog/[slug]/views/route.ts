import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { activityService } from '@/lib/services/activity';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Extract slug from the URL
  const url = req.nextUrl || new URL(req.url);
  const match = url.pathname.match(/\/blog\/([^/]+)\/views/);
  const slug = match ? decodeURIComponent(match[1]) : null;

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  // Get current views
  const { data: current, error: fetchError } = await supabase
    .from('blogs')
    .select('views')
    .eq('slug', slug)
    .single();

  if (fetchError || !current) {
    return NextResponse.json({ error: fetchError?.message || 'Blog not found' }, { status: 500 });
  }

  // increment views
  const { data, error } = await supabase
    .from('blogs')
    .update({ views: (current.views || 0) + 1 })
    .eq('slug', slug)
    .select('views')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity for points (only for authenticated users)
  if (user) {
    try {
      await activityService.logActivity(user.id, 'blog_read', { 
        blog_slug: slug 
      });
      console.log(`✅ Activity logged: blog_read for user ${user.id} on ${slug}`);
    } catch (activityError) {
      console.error('❌ Failed to log blog read activity:', activityError);
      // Don't fail the view increment if activity logging fails
    }
  }

  return NextResponse.json({ views: data.views });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  // extract slug from the url
  const url = req.nextUrl || new URL(req.url);
  const match = url.pathname.match(/\/blog\/([^/]+)\/views/);
  const slug = match ? decodeURIComponent(match[1]) : null;

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('blogs')
    .select('views')
    .eq('slug', slug)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ views: data.views });
} 