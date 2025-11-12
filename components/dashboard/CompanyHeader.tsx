'use client'

import React from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { usePathname } from 'next/navigation'
import { useCompanyContext } from '@/contexts/CompanyContext'
import { NotificationCenter } from '@/components/notifications'

export function CompanyHeader() {
  const pathname = usePathname()
  const { currentCompany } = useCompanyContext()

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: { label: string; href?: string }[] = []

    // Start with Dashboard
    breadcrumbs.push({ label: 'Dashboard', href: `/dashboard/company/${currentCompany?.slug}` })

    // Skip 'dashboard' and 'company' and company slug in paths
    const relevantPaths = paths.slice(3)

    relevantPaths.forEach((path, index) => {
      const label = path
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      if (index === relevantPaths.length - 1) {
        // Last item - no link
        breadcrumbs.push({ label })
      } else {
        // Intermediate items - with link
        const href = `/dashboard/company/${currentCompany?.slug}/${relevantPaths
          .slice(0, index + 1)
          .join('/')}`
        breadcrumbs.push({ label, href })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800 bg-gradient-to-r from-[#181f36] to-[#10172a] px-4">
      <SidebarTrigger className="-ml-1 text-zinc-400 hover:text-white" />
      <Separator orientation="vertical" className="mr-2 h-4 bg-zinc-700" />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <BreadcrumbSeparator className="text-zinc-600" />}
              <BreadcrumbItem>
                {crumb.href ? (
                  <BreadcrumbLink
                    href={crumb.href}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="text-white font-medium">
                    {crumb.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto">
        <NotificationCenter />
      </div>
    </header>
  )
}
