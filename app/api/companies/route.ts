import { NextRequest, NextResponse } from 'next/server'
import { companyService } from '@/lib/services/company-service'
import { CompanyFilters, CompanyError } from '@/types/company'
import { UnifiedCache } from '@/lib/unified-cache-system'

// Force Node.js runtime for API routes
export const runtime = 'nodejs'

/**
 * GET /api/companies
 * List all verified companies with optional filters
 * Public endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse filters from query parameters
    const filters: CompanyFilters = {
      search: searchParams.get('search') || undefined,
      industry: searchParams.get('industry') || undefined,
      company_size: searchParams.get('company_size') || undefined,
      verification_status: searchParams.get('verification_status') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    }

    // Fetch from database - no caching to prevent stale data
    const result = await companyService.listCompanies(filters)

    // Return with no-cache headers to prevent stale data
    return UnifiedCache.createResponse(result, 'USER_PRIVATE')
  } catch (error) {
    console.error('Error in GET /api/companies:', error)

    if (error instanceof CompanyError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        companies: [],
        total: 0,
        hasMore: false,
      },
      { status: 500 }
    )
  }
}
