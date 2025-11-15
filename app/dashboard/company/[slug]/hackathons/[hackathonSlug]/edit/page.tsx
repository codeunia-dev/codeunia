'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useCompanyContext } from '@/contexts/CompanyContext'
import { HackathonForm } from '@/components/dashboard/HackathonForm'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Hackathon } from '@/types/hackathons'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function EditHackathonPage() {
  const router = useRouter()
  const params = useParams()
  const companySlug = params.slug as string
  const hackathonSlug = params.hackathonSlug as string
  const { currentCompany, loading: companyLoading } = useCompanyContext()
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const fetchHackathon = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/hackathons/${hackathonSlug}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch hackathon')
      }

      const data = await response.json()
      setHackathon(data)
    } catch (error) {
      console.error('Error fetching hackathon:', error)
      toast.error('Failed to load hackathon')
      router.push(`/dashboard/company/${companySlug}/hackathons`)
    } finally {
      setLoading(false)
    }
  }, [hackathonSlug, companySlug, router])

  useEffect(() => {
    if (hackathonSlug) {
      fetchHackathon()
    }
  }, [hackathonSlug, fetchHackathon])

  const handleSuccess = (updatedHackathon: Hackathon) => {
    setHackathon(updatedHackathon)
    toast.success('Hackathon updated successfully!')
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      const response = await fetch(`/api/hackathons/${hackathon?.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete hackathon')
      }

      toast.success('Hackathon deleted successfully!')
      router.push(`/dashboard/company/${companySlug}/hackathons`)
    } catch (error) {
      console.error('Error deleting hackathon:', error)
      toast.error('Failed to delete hackathon')
    } finally {
      setDeleting(false)
    }
  }

  if (loading || companyLoading || !currentCompany) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!hackathon) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Hackathon not found</h2>
          <p className="text-muted-foreground mb-4">
            The hackathon you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Link href={`/dashboard/company/${companySlug}/hackathons`}>
            <Button>Back to Hackathons</Button>
          </Link>
        </div>
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
          <h1 className="text-3xl font-bold tracking-tight">Edit Hackathon</h1>
          <p className="text-muted-foreground mt-1">
            Update your hackathon details
          </p>
        </div>

        <HackathonForm
          company={currentCompany}
          hackathon={hackathon}
          mode="edit"
          onSuccess={handleSuccess}
        />

        <div className="flex items-center justify-between pt-6 border-t dark:border-gray-800">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Danger Zone</p>
            <p>Once you delete a hackathon, there is no going back.</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Hackathon
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the hackathon
                  &quot;{hackathon.title}&quot; and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting ? 'Deleting...' : 'Delete Hackathon'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
