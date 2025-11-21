// API route to fetch company data for resubmission after rejection
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/companies/resubmit/[id]
 * Fetch company data for resubmission (owner only)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient()
        const { id: companyId } = await params

        // Check authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get company details
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', companyId)
            .single()

        if (companyError || !company) {
            return NextResponse.json(
                { success: false, error: 'Company not found' },
                { status: 404 }
            )
        }

        // Verify the user is the company owner
        console.log('🔍 Ownership verification:', {
            userId: user.id,
            companyOwnerId: company.owner_id,
            match: company.owner_id === user.id,
            companyId: company.id,
            companyName: company.name
        });

        if (company.owner_id !== user.id) {
            return NextResponse.json(
                { success: false, error: 'Forbidden: You are not the owner of this company' },
                { status: 403 }
            )
        }
        // Only allow resubmission for rejected companies
        if (company.verification_status !== 'rejected') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Company is not in rejected status',
                    currentStatus: company.verification_status
                },
                { status: 400 }
            )
        }

        // Return company data for form pre-population
        return NextResponse.json({
            success: true,
            company: {
                id: company.id,
                name: company.name,
                legal_name: company.legal_name,
                email: company.email,
                phone: company.phone,
                website: company.website,
                industry: company.industry,
                company_size: company.company_size,
                description: company.description,
                // Construct address object from individual columns
                address: {
                    street: company.address_street || '',
                    city: company.address_city || '',
                    state: company.address_state || '',
                    country: company.address_country || '',
                    zip: company.address_zip || '',
                },
                // Construct socials object from individual columns
                socials: {
                    linkedin: company.linkedin_url || '',
                    twitter: company.twitter_url || '',
                    facebook: company.facebook_url || '',
                    instagram: company.instagram_url || '',
                },
                verification_status: company.verification_status,
                verification_notes: company.verification_notes,
                logo_url: company.logo_url,
            },
        })
    } catch (error) {
        console.error('Unexpected error in GET /api/companies/resubmit/[id]:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
