'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CompanySidebar } from '@/components/dashboard/CompanySidebar'
import { CompanyHeader } from '@/components/dashboard/CompanyHeader'
import { CompanyProvider, useCompanyContext } from '@/contexts/CompanyContext'
import {
  LayoutDashboard,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Trophy,
  CreditCard,
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRoleProtection } from '@/lib/hooks/useRoleProtection'
import { createClient } from '@/lib/supabase/client'

export type SidebarGroupType = {
  title: string
  items: {
    title: string
    url: string
    icon: React.ElementType
  }[]
}

export default function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, error } = useAuth()
  const { isChecking, isAuthorized } = useRoleProtection('company_member')
  const params = useParams()
  const companySlug = params?.slug as string | undefined

  // Prevent hydration mismatch by using a consistent initial state
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-black">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2 text-red-600">
            Authentication Error
          </h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!user || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-black">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2 text-white">
            Authentication Required
          </h1>
          <p className="text-muted-foreground mb-4">
            Please sign in to access the company dashboard.
          </p>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <CompanyProvider initialCompanySlug={companySlug}>
      <CompanyDashboardContent user={user}>
        {children}
      </CompanyDashboardContent>
    </CompanyProvider>
  )
}

interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
}

// Component that uses CompanyContext to conditionally render sidebar
function CompanyDashboardContent({
  user,
  children,
}: {
  user: { id: string; email?: string; user_metadata?: { first_name?: string } } | null
  children: React.ReactNode
}) {
  const params = useParams()
  const companySlug = params?.slug as string
  const { currentCompany, userCompanies, loading, error } = useCompanyContext()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // Fetch user profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) return
      
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, avatar_url')
          .eq('id', user.id)
          .single()
        
        if (!error && data) {
          setUserProfile(data)
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }
    
    fetchProfile()
  }, [user?.id])

  const avatarUrl = userProfile?.avatar_url
  const avatarInitial =
    userProfile?.first_name?.[0]?.toUpperCase() ||
    user?.user_metadata?.first_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    'C'
  const name = userProfile?.first_name || user?.user_metadata?.first_name || user?.email || 'User'
  const email = user?.email || 'user@codeunia.com'

  // Show loading while company context is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If no company access (error or no currentCompany), don't render sidebar
  if (error || !currentCompany) {
    return <div className="bg-black min-h-screen w-full">{children}</div>
  }

  // Check if user has pending invitation (not yet accepted)
  const membership = userCompanies.find(
    (uc) => uc.company.slug === companySlug
  )
  const isPendingInvitation = membership?.status === 'pending'

  // If user has pending invitation, don't show sidebar (only show invitation page)
  if (isPendingInvitation) {
    return <div className="bg-black min-h-screen w-full">{children}</div>
  }

  // Generate sidebar items with dynamic company slug
  const sidebarItems: SidebarGroupType[] = [
    {
      title: 'Dashboard',
      items: [
        {
          title: 'Overview',
          url: `/dashboard/company/${companySlug}`,
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          title: 'Events',
          url: `/dashboard/company/${companySlug}/events`,
          icon: Calendar,
        },
        {
          title: 'Hackathons',
          url: `/dashboard/company/${companySlug}/hackathons`,
          icon: Trophy,
        },
        {
          title: 'Team',
          url: `/dashboard/company/${companySlug}/team`,
          icon: Users,
        },
      ],
    },
    {
      title: 'Analytics',
      items: [
        {
          title: 'Analytics',
          url: `/dashboard/company/${companySlug}/analytics`,
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          title: 'Company Settings',
          url: `/dashboard/company/${companySlug}/settings`,
          icon: Settings,
        },
        {
          title: 'Subscription',
          url: `/dashboard/company/${companySlug}/subscription`,
          icon: CreditCard,
        },
      ],
    },
  ]

  return (
    <CompanySidebar
      avatarUrl={avatarUrl}
      avatarInitial={avatarInitial}
      name={name}
      email={email}
      sidebarItems={sidebarItems}
      header={<CompanyHeader />}
    >
      <div className="bg-black min-h-screen w-full">{children}</div>
    </CompanySidebar>
  )
}
