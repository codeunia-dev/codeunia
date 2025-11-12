import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { companyService } from '@/lib/services/company-service'
import { SubscriptionManagement } from '@/components/subscription/SubscriptionManagement'

export const metadata: Metadata = {
  title: 'Subscription Management | CodeUnia',
  description: 'Manage your company subscription and billing',
}

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function SubscriptionPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/signin')
  }

  // Get company
  const company = await companyService.getCompanyBySlug(slug)

  if (!company) {
    redirect('/dashboard/company')
  }

  // Check if user is a member of this company
  const { data: membership } = await supabase
    .from('company_members')
    .select('role, status')
    .eq('company_id', company.id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (!membership) {
    redirect('/dashboard/company')
  }

  // Only owners and admins can manage subscription
  if (!['owner', 'admin'].includes(membership.role)) {
    redirect(`/dashboard/company/${slug}`)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-muted-foreground">
          Manage your subscription plan and view usage details
        </p>
      </div>

      <SubscriptionManagement company={company} userRole={membership.role} />
    </div>
  )
}
