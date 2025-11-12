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

    // Try to get from cache first
    const cacheKey = `companies:list:${JSON.stringify(filters)}`
    const cached = await UnifiedCache.get(cacheKey)

    if (cached) {
      return UnifiedCache.createResponse(cached, 'API_STANDARD')
    }

    // Fetch from database
    const result = await companyService.listCompanies(filters)

    // Cache the result
    await UnifiedCache.set(cacheKey, result, 'API_STANDARD')

    return UnifiedCache.createResponse(result, 'API_STANDARD')
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
