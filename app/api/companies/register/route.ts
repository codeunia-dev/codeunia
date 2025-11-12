import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { companyService } from '@/lib/services/company-service'
import { CompanyRegistrationData, CompanyError } from '@/types/company'
import { uploadVerificationDocuments } from '@/lib/storage/company-documents'
import {
  getNewCompanyRegistrationNotification,
  sendCompanyEmail,
} from '@/lib/email/company-emails'

// Force Node.js runtime for API routes
export const runtime = 'nodejs'

/**
 * POST /api/companies/register
 * Register a new company
 * Requires authentication
 * Supports both JSON and FormData (for file uploads)
 */
export async function POST(request: NextRequest) {
  try {
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

    // Check content type to determine how to parse the request
    const contentType = request.headers.get('content-type') || ''
    let body: Record<string, unknown>
    let verificationFiles: File[] = []

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (with file uploads)
      const formData = await request.formData()

      // Extract form fields
      body = {}
      const fileFields: File[] = []

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          // Collect verification documents
          if (key === 'verification_documents' || key.startsWith('verification_document')) {
            fileFields.push(value)
          }
        } else {
          // Parse JSON fields if they're stringified
          try {
            body[key] = JSON.parse(value as string)
          } catch {
            body[key] = value
          }
        }
      }

      verificationFiles = fileFields
    } else {
      // Handle JSON
      body = await request.json()
    }

    // Validate required fields
    const requiredFields = ['name', 'email', 'website', 'industry', 'company_size', 'description']
    const missingFields = requiredFields.filter((field) => !body[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: `Required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Prepare registration data
    const registrationData: CompanyRegistrationData = {
      name: body.name as string,
      legal_name: body.legal_name as string | undefined,
      email: body.email as string,
      website: body.website as string,
      industry: body.industry as string,
      company_size: body.company_size as string,
      description: body.description as string,
      phone: body.phone as string | undefined,
      address: body.address as Record<string, string> | undefined,
      socials: body.socials as Record<string, string> | undefined,
    }

    // Create company
    const company = await companyService.createCompany(registrationData, user.id)

    // Upload verification documents if provided
    let uploadedDocuments: string[] = []
    if (verificationFiles.length > 0) {
      try {
        const uploadResults = await uploadVerificationDocuments(
          verificationFiles,
          company.id
        )
        uploadedDocuments = uploadResults.map((result) => result.path)

        // Update company with verification document paths
        await companyService.updateCompany(company.id, {
          verification_documents: uploadedDocuments,
        })
      } catch (uploadError) {
        console.error('Error uploading verification documents:', uploadError)
        // Continue even if upload fails - documents can be uploaded later
      }
    }

    // Send admin notification email
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@codeunia.com'
      const emailTemplate = getNewCompanyRegistrationNotification({
        companyName: company.name,
        companyEmail: company.email,
        website: company.website || '',
        industry: company.industry || '',
        companySize: company.company_size || '',
        companyId: company.id,
      })

      await sendCompanyEmail({
        to: adminEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      })
    } catch (emailError) {
      console.error('Error sending admin notification email:', emailError)
      // Continue even if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Company registered successfully. Verification pending.',
        company: {
          ...company,
          verification_documents: uploadedDocuments,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/companies/register:', error)

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
