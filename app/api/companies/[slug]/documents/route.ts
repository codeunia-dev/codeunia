import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { companyService } from '@/lib/services/company-service'
import { companyMemberService } from '@/lib/services/company-member-service'
import { CompanyError } from '@/types/company'
import {
  uploadVerificationDocuments,
  deleteVerificationDocument,
  listCompanyDocuments,
} from '@/lib/storage/company-documents'

// Force Node.js runtime for API routes
export const runtime = 'nodejs'

/**
 * POST /api/companies/[slug]/documents
 * Upload verification documents for a company
 * Requires authentication and company owner/admin role
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

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
    const files: File[] = []

    for (const [, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value)
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No files provided',
        },
        { status: 400 }
      )
    }

    // Upload documents
    const uploadResults = await uploadVerificationDocuments(files, company.id)

    // Get existing documents
    const existingDocuments = (company.verification_documents as string[]) || []

    // Add new document paths
    const allDocuments = [
      ...existingDocuments,
      ...uploadResults.map((result) => result.path),
    ]

    // Update company with new document paths
    await companyService.updateCompany(company.id, {
      verification_documents: allDocuments,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Documents uploaded successfully',
        documents: uploadResults,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in POST /api/companies/[slug]/documents:', error)

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
 * GET /api/companies/[slug]/documents
 * List all verification documents for a company or get a signed URL for a specific document
 * Query params:
 *   - path: (optional) Get signed URL for a specific document path
 * Requires authentication and company membership
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const documentPath = searchParams.get('path')

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

    // Check if user is a member or platform admin
    const member = await companyMemberService.checkMembership(user.id, company.id)

    // Check if user is platform admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isPlatformAdmin = profile?.is_admin || false

    if (!member && !isPlatformAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Not a company member',
        },
        { status: 403 }
      )
    }

    // If path is provided, return signed URL for that document
    if (documentPath) {
      const { getSignedDocumentUrl } = await import('@/lib/storage/company-documents')
      const signedUrl = await getSignedDocumentUrl(documentPath)

      return NextResponse.json(
        {
          success: true,
          url: signedUrl,
        },
        { status: 200 }
      )
    }

    // Otherwise, list all documents
    const documents = await listCompanyDocuments(company.id)

    return NextResponse.json(
      {
        success: true,
        documents,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in GET /api/companies/[slug]/documents:', error)

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
 * DELETE /api/companies/[slug]/documents
 * Delete a verification document
 * Requires authentication and company owner/admin role
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const documentPath = searchParams.get('path')

    if (!documentPath) {
      return NextResponse.json(
        {
          success: false,
          error: 'Document path is required',
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

    // Delete document from storage
    await deleteVerificationDocument(documentPath)

    // Update company record to remove document path
    const existingDocuments = (company.verification_documents as string[]) || []
    const updatedDocuments = existingDocuments.filter((doc) => doc !== documentPath)

    await companyService.updateCompany(company.id, {
      verification_documents: updatedDocuments,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Document deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in DELETE /api/companies/[slug]/documents:', error)

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
