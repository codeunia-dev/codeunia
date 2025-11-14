import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { companyService } from '@/lib/services/company-service'
import { companyMemberService } from '@/lib/services/company-member-service'
import { CompanyError } from '@/types/company'
import {
  uploadCompanyLogo,
  uploadCompanyBanner,
  deleteCompanyAsset,
} from '@/lib/storage/company-assets'
import { UnifiedCache } from '@/lib/unified-cache-system'

// Force Node.js runtime for API routes
export const runtime = 'nodejs'

/**
 * POST /api/companies/[slug]/assets
 * Upload company assets (logo or banner)
 * Requires authentication and company owner/admin role
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const assetType = searchParams.get('type') as 'logo' | 'banner'

    if (!assetType || !['logo', 'banner'].includes(assetType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid asset type. Must be "logo" or "banner"',
        },
        { status: 400 }
      )
    }

    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    // Get company
    const company = await companyService.getCompanyBySlug(slug)

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company not found',
        },
        { status: 404 }
      )
    }

    // Check if user is owner or admin
    const member = await companyMemberService.checkMembership(user.id, company.id)

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions: Owner or admin role required',
        },
        { status: 403 }
      )
    }

    // Parse FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
        },
        { status: 400 }
      )
    }

    // Upload asset based on type
    let uploadResult
    if (assetType === 'logo') {
      uploadResult = await uploadCompanyLogo(file, company.id)
    } else {
      uploadResult = await uploadCompanyBanner(file, company.id)
    }

    // Delete old asset if it exists
    const oldAssetPath =
      assetType === 'logo'
        ? company.logo_url?.split('/').pop()
        : company.banner_url?.split('/').pop()

    if (oldAssetPath) {
      try {
        await deleteCompanyAsset(`${company.id}/${oldAssetPath}`)
      } catch (error) {
        console.error('Error deleting old asset:', error)
        // Continue even if deletion fails
      }
    }

    // Update company with new asset URL
    const updateData =
      assetType === 'logo'
        ? { logo_url: uploadResult.url }
        : { banner_url: uploadResult.url }

    const updatedCompany = await companyService.updateCompany(company.id, updateData)

    // Invalidate cache
    await UnifiedCache.purgeByTags(['content', 'api'])

    return NextResponse.json(
      {
        success: true,
        message: `${assetType} uploaded successfully`,
        [assetType]: uploadResult,
        company: updatedCompany,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in POST /api/companies/[slug]/assets:', error)

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
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/companies/[slug]/assets
 * Delete a company asset (logo or banner)
 * Requires authentication and company owner/admin role
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const assetType = searchParams.get('type') as 'logo' | 'banner'

    if (!assetType || !['logo', 'banner'].includes(assetType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid asset type. Must be "logo" or "banner"',
        },
        { status: 400 }
      )
    }

    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }

    // Get company
    const company = await companyService.getCompanyBySlug(slug)

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company not found',
        },
        { status: 404 }
      )
    }

    // Check if user is owner or admin
    const member = await companyMemberService.checkMembership(user.id, company.id)

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions: Owner or admin role required',
        },
        { status: 403 }
      )
    }

    // Get asset path
    const assetUrl = assetType === 'logo' ? company.logo_url : company.banner_url

    if (!assetUrl) {
      return NextResponse.json(
        {
          success: false,
          error: `No ${assetType} to delete`,
        },
        { status: 404 }
      )
    }

    // Extract path from URL
    const assetPath = assetUrl.split('/').slice(-2).join('/')

    // Delete asset from storage
    await deleteCompanyAsset(assetPath)

    // Update company to remove asset URL - use direct Supabase update to set null
    const columnName = assetType === 'logo' ? 'logo_url' : 'banner_url'
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({ [columnName]: null })
      .eq('id', company.id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update company: ${updateError.message}`)
    }

    // Invalidate cache
    await UnifiedCache.purgeByTags(['content', 'api'])

    return NextResponse.json(
      {
        success: true,
        message: `${assetType} deleted successfully`,
        company: updatedCompany,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in DELETE /api/companies/[slug]/assets:', error)

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
      },
      { status: 500 }
    )
  }
}
