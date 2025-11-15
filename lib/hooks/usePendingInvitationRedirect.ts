import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCompanyContext } from '@/contexts/CompanyContext'

/**
 * Hook to redirect users with pending invitations to the accept-invitation page
 * This prevents unauthorized access to company pages before accepting the invitation
 */
export function usePendingInvitationRedirect() {
  const router = useRouter()
  const { currentCompany, userCompanies, loading } = useCompanyContext()

  useEffect(() => {
    if (loading || !currentCompany) return

    const membership = userCompanies.find(
      (uc) => uc.company.slug === currentCompany.slug
    )

    if (membership?.status === 'pending') {
      router.push(`/dashboard/company/${currentCompany.slug}/accept-invitation`)
    }
  }, [currentCompany, userCompanies, loading, router])

  // Return whether the user has a pending invitation
  const membership = userCompanies.find(
    (uc) => uc.company?.slug === currentCompany?.slug
  )
  return membership?.status === 'pending'
}
