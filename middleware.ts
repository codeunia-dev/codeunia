import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { reservedUsernameService } from '@/lib/services/reserved-usernames';

// Function to award daily login points
async function awardDailyLoginPoints(userId: string, supabase: any) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user already got points today
    const { data: existing, error: checkError } = await supabase
      .from('user_activity_log')
      .select('id')
      .eq('user_id', userId)
      .eq('activity_type', 'daily_login')
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing daily login:', checkError);
      return;
    }

    // If no daily login today, award points
    if (!existing) {
      // Log the activity
      const { error: logError } = await supabase
        .from('user_activity_log')
        .insert([{
          user_id: userId,
          activity_type: 'daily_login',
          points_awarded: 5
        }]);

      if (logError) {
        console.error('Error logging daily login activity:', logError);
        return;
      }

      // Update user points
      const { data: userPoints, error: pointsError } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', userId)
        .single();

      if (pointsError) {
        console.error('Error fetching user points:', pointsError);
        return;
      }

      const currentPoints = userPoints?.total_points || 0;
      const { error: updateError } = await supabase
        .from('user_points')
        .update({
          total_points: currentPoints + 5,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating user points:', updateError);
      }
    }
  } catch (error) {
    console.error('Error in awardDailyLoginPoints:', error);
  }
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              req.cookies.set(name, value);
              res.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Define public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/auth/signin',
      '/auth/signup',
      '/auth/callback',
      '/auth/error',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/update-password',
      '/auth/confirm',
      '/auth/sign-up-success',
      '/auth/email-confirmation-required',
      '/verify/cert',
      '/terms',
      '/privacy',
      '/about',
      '/contact',
      '/blogs',
      '/events',
      '/hackathons',
      '/premium',
      '/opportunities',
      '/tests',
      '/blog',
      '/leaderboard',
      '/join',
      '/refund',
      '/api/auth',
      '/api/webhooks',
    ];

    // Check if the current path is public first
    const isPublicRoute = publicRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route) || 
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.startsWith('/api/') ||
      req.nextUrl.pathname.includes('.')
    );

    // If it's a public route, allow access immediately
    if (isPublicRoute) {
      return res;
    }

    // Handle username-based routing (only for non-public routes)
    const pathname = req.nextUrl.pathname;
    const usernameMatch = pathname.match(/^\/([^\/]+)$/);
    
    // Exclude admin routes from username routing
    const adminRoutes = ['/admin', '/admin/', '/admin/users', '/admin/tests', '/admin/events', '/admin/blog-posts', '/admin/certificates', '/admin/pending-payments', '/admin/reserved-usernames'];
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    
    if (usernameMatch && !isAdminRoute) {
      const username = usernameMatch[1];
      
      // Check if username is reserved
      try {
        const isReserved = await reservedUsernameService.isReservedUsername(username);
        if (isReserved) {
          // Return 404 for reserved usernames
          return NextResponse.rewrite(new URL('/_not-found', req.url));
        }
      } catch (error) {
        // Fallback to hardcoded check if database is not available
        if (reservedUsernameService.isFallbackReservedUsername(username)) {
          return NextResponse.rewrite(new URL('/_not-found', req.url));
        }
      }
      
      // For non-reserved usernames, treat as public profile route
      // This allows public access to user profiles
      return res;
    }

    // Allow most API routes to pass through, but protect admin routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      // Admin API routes require authentication
      if (req.nextUrl.pathname.startsWith('/api/admin/')) {
        if (!user) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }
      }
      return res;
    }

    // If no user, redirect to signin
    if (!user) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/auth/signin';
      redirectUrl.searchParams.set('returnUrl', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user has completed unified setup flow
    const { data: setupStatus } = await supabase
      .rpc('get_user_setup_status', { user_id: user.id });

    if (setupStatus && !setupStatus.can_proceed) {
      // User setup is not complete, redirect based on next step
      if (req.nextUrl.pathname !== '/setup' && req.nextUrl.pathname !== '/auth/confirm' && req.nextUrl.pathname !== '/auth/email-confirmation-required') {
        const redirectUrl = req.nextUrl.clone();
        
        if (setupStatus.next_step === 'confirm_email') {
          // For email users who haven't confirmed, redirect to email confirmation page
          redirectUrl.pathname = '/auth/email-confirmation-required';
        } else {
          // For other incomplete setups, redirect to setup page
          redirectUrl.pathname = '/setup';
        }
        
        return NextResponse.redirect(redirectUrl);
      }
    } else if (setupStatus && setupStatus.can_proceed) {
      // If setup is complete and user is on setup page, redirect to dashboard
      if (req.nextUrl.pathname === '/setup') {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/protected/dashboard';
        return NextResponse.redirect(redirectUrl);
      }
      
      // Award daily login points (only once per day)
      try {
        await awardDailyLoginPoints(user.id, supabase);
      } catch (error) {
        console.error('Error awarding daily login points:', error);
      }
    }

    // Apply production-grade cache headers before returning response
    let finalResponse = res;
    
    return finalResponse;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow the request to continue with basic headers
    const errorResponse = NextResponse.next();
    errorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return errorResponse;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     * - images, css, js files
     */
    '/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|css|js|woff|woff2)$).*)',
  ],
};
