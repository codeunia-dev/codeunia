'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useRoleProtection(requiredRole: 'student' | 'company_member') {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    async function checkRole() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/signin')
          return
        }

        // Check if user is a company member and get their company slug
        const { data: companyMembership } = await supabase
          .from('company_members')
          .select(`
            id,
            company:companies(slug)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle()

        const isCompanyMember = !!companyMembership

        // Determine if user has the required role
        if (requiredRole === 'company_member') {
          if (!isCompanyMember) {
            // User is a student trying to access company routes
            router.push('/protected')
            return
          }
        } else if (requiredRole === 'student') {
          if (isCompanyMember) {
            // User is a company member trying to access student routes
            // Redirect to their company dashboard with the correct slug
            const company = companyMembership.company as unknown as { slug: string } | null
            const companySlug = company?.slug
            if (companySlug) {
              router.push(`/dashboard/company/${companySlug}`)
            } else {
              // Fallback if slug is not available
              router.push('/dashboard/company')
            }
            return
          }
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error('Error checking role:', error)
        router.push('/auth/signin')
      } finally {
        setIsChecking(false)
      }
    }

    checkRole()
  }, [requiredRole, router])

  return { isChecking, isAuthorized }
}