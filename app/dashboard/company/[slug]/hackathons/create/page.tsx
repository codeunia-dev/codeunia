'use client'

import { useRouter, useParams } from 'next/navigation'
import { useCompanyContext } from '@/contexts/CompanyContext'
import { HackathonForm } from '@/components/dashboard/HackathonForm'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CreateHackathonPage() {
  const router = useRouter()
  const params = useParams()
  const companySlug = params.slug as string
  const { currentCompany, loading: companyLoading } = useCompanyContext()

  const handleSuccess = () => {
    router.push(`/dashboard/company/${companySlug}/hackathons`)
  }

  if (companyLoading || !currentCompany) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen dark:bg-black dark:text-white">
      <div className="space-y-6">
        <Link href={`/dashboard/company/${companySlug}/hackathons`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Hackathons
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Hackathon</h1>
          <p className="text-muted-foreground mt-1">
            Create a new hackathon for your company
          </p>
        </div>

        <HackathonForm
          company={currentCompany}
          mode="create"
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  )
}
