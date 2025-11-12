import { NextRequest, NextResponse } from 'next/server';
import { eventsService, EventsFilters, EventError } from '@/lib/services/events';
import { UnifiedCache } from '@/lib/unified-cache-system';
import { createClient } from '@/lib/supabase/server';
import { authorizationService } from '@/lib/services/authorization-service';
import { companyMemberService } from '@/lib/services/company-member-service';
import { subscriptionService } from '@/lib/services/subscription-service';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// Define the type for event data in POST request
interface EventData {
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

// GET: Fetch events with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: EventsFilters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      dateFilter: (searchParams.get('dateFilter') as 'upcoming' | 'past' | 'all') || 'all',
      company_id: searchParams.get('company_id') || undefined,
      company_industry: searchParams.get('company_industry') || undefined,
      company_size: searchParams.get('company_size') || undefined,
      approval_status: searchParams.get('approval_status') as 'pending' | 'approved' | 'rejected' | 'changes_requested' | undefined,
      limit: parseInt(searchParams.get('limit') || '10'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    // Try to get from cache first
    const cacheKey = `events:${JSON.stringify(filters)}`;
    const cached = await UnifiedCache.get(cacheKey);
    
    if (cached) {
      return UnifiedCache.createResponse(cached, 'API_STANDARD');
    }

    // Fetch from database
    const result = await eventsService.getEvents(filters);
    
    // Cache the result
    await UnifiedCache.set(cacheKey, result, 'API_STANDARD');

    return UnifiedCache.createResponse(result, 'API_STANDARD');

  } catch (error) {
    console.error('Error in GET /api/events:', error);
    return UnifiedCache.createResponse({
      events: [],
      total: 0,
      hasMore: false
    }, 'USER_PRIVATE');
  }
}

// POST: Create a new event
export async function POST(request: NextRequest) {
  try {
    const eventData: EventData = await request.json();

    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is platform admin (can create events without company)
    const isPlatformAdmin = await authorizationService.isPlatformAdmin(user.id);

    let companyId: string | undefined;

    if (isPlatformAdmin) {
      // Platform admin can optionally specify company_id or create CodeUnia events
      companyId = eventData.company_id;
    } else {
      // Regular users must be part of a company
      const userCompanies = await companyMemberService.getUserCompanies(user.id);
      
      if (userCompanies.length === 0) {
        return NextResponse.json(
          { error: 'You must be a member of a company to create events' },
          { status: 403 }
        );
      }

      // Auto-set company_id from user's first active company with create permissions
      let selectedCompany = null;
      for (const membership of userCompanies) {
        if (membership.status === 'active' && membership.company.verification_status === 'verified') {
          const canCreate = await authorizationService.canCreateEvent(user.id, membership.company.id);
          if (canCreate) {
            selectedCompany = membership.company;
            break;
          }
        }
      }

      if (!selectedCompany) {
        return NextResponse.json(
          { error: 'You do not have permission to create events for any company' },
          { status: 403 }
        );
      }

      companyId = selectedCompany.id;

      // Check subscription limits for non-admin users
      const limitCheck = await subscriptionService.checkSubscriptionLimit(
        companyId,
        'create_event'
      );

      if (!limitCheck.allowed) {
        return NextResponse.json(
          {
            error: limitCheck.reason,
            upgrade_required: limitCheck.upgrade_required,
            current_usage: limitCheck.current_usage,
            limit: limitCheck.limit,
          },
          { status: 403 }
        );
      }
    }

    // Create event using service
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const event = await eventsService.createEvent(
      eventData as any,
      user.id,
      companyId!
    );
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Invalidate event caches after successful creation
    await UnifiedCache.purgeByTags(['content', 'api']);

    return NextResponse.json(
      { message: 'Event created successfully', event },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in POST /api/events:', error);
    
    if (error instanceof EventError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
