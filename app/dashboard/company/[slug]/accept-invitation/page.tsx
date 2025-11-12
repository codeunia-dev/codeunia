'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

export default function AcceptInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const companySlug = params?.slug as string
  const { user, loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [companyName, setCompanyName] = useState<string>('')

  // Check invitation status
  useEffect(() => {
    const checkInvitation = async () => {
      if (authLoading) return
      
      if (!user) {
        setError('Please sign in to accept the invitation')
        setLoading(false)
        return
      }

      try {
        // Fetch company details
        const companyResponse = await fetch(`/api/companies/${companySlug}`)
        if (!companyResponse.ok) {
          throw new Error('Company not found')
        }
        const companyData = await companyResponse.json()
        setCompanyName(companyData.company?.name || companySlug)

        // Check if user has a pending invitation
        const membersResponse = await fetch(`/api/companies/${companySlug}/members`)
        if (!membersResponse.ok) {
          throw new Error('Failed to check invitation status')
        }
        const membersData = await membersResponse.json()
        const members = membersData.members || []
        
        const userMembership = members.find((m: { user_id: string; status: string }) => m.user_id === user.id)
        
        if (!userMembership) {
          setError('No invitation found for your account')
        } else if (userMembership.status === 'active') {
          setError('You have already accepted this invitation')
        } else if (userMembership.status === 'pending') {
          // Valid pending invitation
          setError(null)
        } else {
          setError('Invalid invitation status')
        }
      } catch (err) {
        console.error('Error checking invitation:', err)
        setError(err instanceof Error ? err.message : 'Failed to check invitation')
      } finally {
        setLoading(false)
      }
    }

    checkInvitation()
  }, [companySlug, user, authLoading])

  const handleAccept = async () => {
    if (!user) return

    try {
      setAccepting(true)
      setError(null)

      // Fetch company to get ID
      const companyResponse = await fetch(`/api/companies/${companySlug}`)
      if (!companyResponse.ok) {
        throw new Error('Company not found')
      }
      const companyData = await companyResponse.json()
      const companyId = companyData.company?.id

      if (!companyId) {
        throw new Error('Invalid company')
      }

      // Accept invitation
      const response = await fetch(`/api/companies/${companySlug}/members/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation')
      }

      setSuccess(true)
      
      // Redirect to company dashboard after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/company/${companySlug}`)
      }, 2000)
    } catch (err) {
      console.error('Error accepting invitation:', err)
      setError(err instanceof Error ? err.message : 'Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  const handleDecline = () => {
    router.push('/dashboard')
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black px-4">
        <Card className="max-w-md w-full bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Sign In Required</CardTitle>
            <CardDescription>Please sign in to accept the invitation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <a href={`/auth/signin?redirect=/dashboard/company/${companySlug}/accept-invitation`}>
                Sign In
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black px-4">
        <Card className="max-w-md w-full bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-white">Invitation Accepted!</CardTitle>
                <CardDescription>Welcome to {companyName}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You are now a member of {companyName}. Redirecting to the company dashboard...
            </p>
            <div className="flex items-center gap-2 text-sm text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Redirecting...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <Card className="max-w-md w-full bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Team Invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join {companyName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <p className="text-sm text-zinc-300 mb-2">
                  You&apos;ve been invited to join <strong className="text-white">{companyName}</strong> on CodeUnia.
                </p>
                <p className="text-sm text-zinc-400">
                  By accepting this invitation, you&apos;ll be able to collaborate with the team and manage events.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                >
                  {accepting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept Invitation
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDecline}
                  variant="outline"
                  disabled={accepting}
                >
                  Decline
                </Button>
              </div>
            </>
          )}

          {error && (
            <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
              <ArrowRight className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
