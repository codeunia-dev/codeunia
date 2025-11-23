import { NextRequest, NextResponse } from 'next/server';
import { hackathonsService, HackathonsFilters } from '@/lib/services/hackathons';
import { UnifiedCache } from '@/lib/unified-cache-system';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// Define the type for hackathon data in POST request
interface HackathonData {
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  organizer: string;
  organizer_contact?: string;
  date: string;
  time: string;
  duration: string;
  category: string;
  categories?: string[];
  tags?: string[];
  featured?: boolean;
  image?: string;
  location: string;
  locations?: string[];
  capacity: number;
  registered?: number;
  price: number;
  payment: string;
  status?: string;
  eventType?: string[];
  teamSize?: number;
  userTypes?: string[];
  registration_required?: boolean;
  registration_deadline?: string;
  rules?: string[];
  schedule?: unknown[];
  prize?: string;
  prize_details?: string;
  faq?: unknown[];
  socials?: Record<string, string>;
  sponsors?: unknown[];
  marking_scheme?: unknown;
  company_id?: string;
}

// GET: Fetch hackathons with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: HackathonsFilters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      featured: searchParams.get('featured') === 'true' ? true : 
                searchParams.get('featured') === 'false' ? false : undefined,
      dateFilter: searchParams.get('dateFilter') as HackathonsFilters['dateFilter'] || undefined,
      company_id: searchParams.get('company_id') || undefined,
      company_industry: searchParams.get('company_industry') || undefined,
      company_size: searchParams.get('company_size') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    // Fetch from database - no caching to prevent stale data
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 8000);
    });

    const resultPromise = hackathonsService.getHackathons(filters);
    const result = await Promise.race([resultPromise, timeoutPromise]);

    // Return with no-cache headers to prevent stale data
    return UnifiedCache.createResponse(result, 'USER_PRIVATE');
    
  } catch (error) {
    console.error('Error in GET /api/hackathons:', error);
    
    // Return fallback data without caching errors
    return UnifiedCache.createResponse({
      hackathons: [],
      total: 0,
      hasMore: false
    }, 'USER_PRIVATE');
  }
}

// POST: Create a new hackathon
export async function POST(request: NextRequest) {
  try {
    const hackathonData: HackathonData = await request.json();

    // Check for authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    let isAuthorized = false;

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    if (profile?.is_admin) {
      isAuthorized = true;
    }

    // If not admin, check if user is a member of the company
    if (!isAuthorized && hackathonData.company_id) {
      const { data: membership } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', hackathonData.company_id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      
      if (membership) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be a company member or admin to create hackathons' },
        { status: 401 }
      );
    }

    // Use service client for admin operations
    const supabaseServiceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseService = createServiceClient(supabaseServiceUrl, supabaseServiceKey);

    // Insert the new hackathon
    const { data, error } = await supabaseService
      .from('hackathons')
      .insert([{
        ...hackathonData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating hackathon:', error);
      return UnifiedCache.createResponse(
        { error: 'Failed to create hackathon', details: error.message },
        'USER_PRIVATE'
      );
    }

    // Invalidate hackathon caches after successful creation
    await UnifiedCache.purgeByTags(['content', 'api']);

    return NextResponse.json(
      { message: 'Hackathon created successfully', hackathon: data },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in POST /api/hackathons:', error);
    return UnifiedCache.createResponse(
      { error: 'Internal server error' },
      'USER_PRIVATE'
    );
  }
}
