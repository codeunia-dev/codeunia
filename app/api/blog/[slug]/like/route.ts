import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { activityService } from '@/lib/services/activity';

// Helper to get current user
async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper to extract slug from the request URL
function getSlugFromRequest(req: NextRequest): string | null {
  // /api/blog/[slug]/like
  const url = req.nextUrl || new URL(req.url);
  const match = url.pathname.match(/\/blog\/([^/]+)\/like/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const blog_slug = getSlugFromRequest(req);
  if (!blog_slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }
  // Get like count
  const { count, error: countError } = await supabase
    .from('blog_likes')
    .select('*', { count: 'exact', head: true })
    .eq('blog_slug', blog_slug);

  // Get current user
  const user = await getUser();
  let likedByUser = false;
  if (user) {
    const { data: userLike } = await supabase
      .from('blog_likes')
      .select('id')
      .eq('blog_slug', blog_slug)
      .eq('user_id', user.id)
      .maybeSingle();
    likedByUser = !!userLike;
  }

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }
  return NextResponse.json({ count: count ?? 0, likedByUser });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const blog_slug = getSlugFromRequest(req);
  if (!blog_slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }
  
  // Insert like (ignore if already exists due to unique constraint)
  const { error } = await supabase
    .from('blog_likes')
    .insert({ user_id: user.id, blog_slug });
  
  if (error && !error.message.includes('duplicate key')) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity for points (only if like was actually added)
  if (!error || !error.message.includes('duplicate key')) {
    try {
      await activityService.logActivity(user.id, 'blog_like', { 
        blog_slug 
      });
      console.log(`✅ Activity logged: blog_like for user ${user.id} on ${blog_slug}`);
    } catch (activityError) {
      console.error('❌ Failed to log blog like activity:', activityError);
      // Don't fail the like operation if activity logging fails
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const blog_slug = getSlugFromRequest(req);
  if (!blog_slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }
  const { error } = await supabase
    .from('blog_likes')
    .delete()
    .eq('user_id', user.id)
    .eq('blog_slug', blog_slug);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 