'use client'

import { useMemo, useState, useCallback } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import type { Profile } from '@/types/profile'

type Domain = 'Web Development' | 'Python' | 'Artificial Intelligence' | 'Machine Learning' | 'Java'
type Level = 'Beginner' | 'Intermediate' | 'Advanced'

type Internship = {
  id: string
  title: string
  description: string
  type: 'Free' | 'Paid'
  domains: Domain[]
  levels: Level[]
  priceInr?: number
  benefits: string[]
}

const INTERNSHIPS: Internship[] = [
  {
    id: 'free-basic',
    title: 'Codeunia Starter Internship',
    description: 'Learn by doing real tasks with mentor check-ins. Remote friendly.',
    type: 'Free',
    domains: ['Web Development', 'Python', 'Java'],
    levels: ['Beginner', 'Intermediate'],
    benefits: [
      'Mentor-curated task list and review checkpoints',
      'Certificate on successful completion',
      'Access to Codeunia community and weekly standups',
      'Resume and GitHub review at the end',
      'Shortlisted for partner hackathons and projects'
    ]
  },
  {
    id: 'paid-pro',
    title: 'Codeunia Pro Internship',
    description: 'Work on production-grade projects with weekly reviews and certificate.',
    type: 'Paid',
    domains: ['Web Development', 'Artificial Intelligence', 'Machine Learning'],
    levels: ['Intermediate', 'Advanced'],
    priceInr: 4999,
    benefits: [
      'Guaranteed project with production code merges',
      '1:1 mentor reviews every week',
      'Priority career guidance + mock interview',
      'Letter of Recommendation (based on performance)',
      'Premium certificate and LinkedIn showcase assets',
      'Early access to partner roles and referrals'
    ]
  }
]

export default function InternshipLandingPage() {
  const { user } = useAuth()
  const { profile, isComplete, updateProfile, loading: profileLoading, refresh } = useProfile()
  const [appliedIds, setAppliedIds] = useState<string[]>([])
  const [domainFilter, setDomainFilter] = useState<Domain | 'All'>('All')
  const [levelFilter, setLevelFilter] = useState<Level | 'All'>('All')
  const [applyOpen, setApplyOpen] = useState(false)
  const [selected, setSelected] = useState<Internship | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<Domain | ''>('')
  const [selectedLevel, setSelectedLevel] = useState<Level | ''>('')
  const [coverNote, setCoverNote] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<number | ''>('')
  const [profileDraft, setProfileDraft] = useState({
    first_name: '',
    last_name: '',
    github_url: '',
    linkedin_url: ''
  })

  const domains = useMemo<('All' | Domain)[]>(() => ['All', 'Web Development', 'Python', 'Artificial Intelligence', 'Machine Learning', 'Java'], [])
  const levels = useMemo<('All' | Level)[]>(() => ['All', 'Beginner', 'Intermediate', 'Advanced'], [])

  const filtered = useMemo(() => {
    return INTERNSHIPS.filter((i) => (domainFilter === 'All' || i.domains.includes(domainFilter)) && (levelFilter === 'All' || i.levels.includes(levelFilter)))
  }, [domainFilter, levelFilter])

  const openApply = (internship: Internship) => {
    setSelected(internship)
    setSelectedDomain('')
    setSelectedLevel('')
    setCoverNote('')
    setSelectedDuration('')
    setApplyOpen(true)
    if (profile && !isComplete) {
      setProfileDraft({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || ''
      })
    }
  }

  // Load current user's applications
  const loadApplied = useCallback(async () => {
    try {
      if (!user?.id) return
      const res = await fetch('/api/internships/my-applications')
      const data = await res.json()
      if (res.ok && Array.isArray(data.appliedIds)) setAppliedIds(data.appliedIds)
    } finally {}
  }, [user?.id])

  // initial and on user change
  useMemo(() => { if (user?.id) loadApplied() }, [user?.id, loadApplied])

  const handleProfileSave = useCallback(async () => {
    if (!user?.id) return
    try {
      setSavingProfile(true)
      const ok = await updateProfile(profileDraft as Profile)
      if (ok) {
        toast.success('Profile updated')
        await refresh()
      } else {
        toast.error('Failed to update profile')
      }
    } finally {
      setSavingProfile(false)
    }
  }, [profileDraft, updateProfile, refresh, user?.id])

  const handleApply = useCallback(async () => {
    if (!user?.id) {
      toast.error('Please sign in to apply')
      return
    }
    if (!selected) return
    if (!selectedDomain || !selectedLevel) {
      toast.error('Please select domain and level')
      return
    }
    if (!selectedDuration) {
      toast.error('Please select duration')
      return
    }

    try {
      if (!user?.id) {
        toast.error('Not authenticated. Please sign in again.')
        return
      }
      if (selected.type === 'Paid') {
        const basePrice = selectedDuration === 6 ? 999 : 699
        
        // Check if user is a premium member for 50% discount
        const isPremium = profile?.is_premium && profile?.premium_expires_at && 
          new Date(profile.premium_expires_at) > new Date()
        
        const price = isPremium ? Math.floor(basePrice / 2) : basePrice
        
        if (isPremium) {
          toast.success(`🎉 Premium member discount applied! 50% off (₹${basePrice} → ₹${price})`)
        }
        
        // Create Razorpay order
        const orderRes = await fetch('/api/internships/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ internshipId: selected.id, amount: price * 100, currency: 'INR' })
        })
        const orderData = await orderRes.json()
        if (!orderRes.ok) throw new Error(orderData.error || 'Payment init failed')

        // Load Razorpay and open checkout
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
        })

        const options = {
          key: orderData.key,
          amount: price * 100,
          currency: 'INR',
          name: 'Codeunia',
          description: `${selected.title}`,
          order_id: orderData.orderId,
          handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            // On successful payment, record application with payment details
            try {
              const basePrice = selectedDuration === 6 ? 999 : 699
              const isPremium = profile?.is_premium && profile?.premium_expires_at && 
                new Date(profile.premium_expires_at) > new Date()
              const finalPrice = isPremium ? Math.floor(basePrice / 2) : basePrice
              const discountAmount = basePrice - finalPrice

              const res = await fetch('/api/internships/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  internshipId: selected.id,
                  domain: selectedDomain,
                  level: selectedLevel,
                  coverNote,
                  durationWeeks: selectedDuration,
                  // Payment information
                  orderId: orderData.orderId,
                  paymentId: response.razorpay_payment_id,
                  paymentSignature: response.razorpay_signature,
                  amountPaid: finalPrice * 100, // in paise
                  originalAmount: basePrice * 100, // in paise
                  discountApplied: discountAmount * 100, // in paise
                  paymentMethod: 'razorpay'
                })
              })
              const data = await res.json()
              if (!res.ok) throw new Error(data.error || 'Failed to apply')
              
              toast.success(`🎉 Payment successful! Application submitted for ${selected.title}`)
              setApplyOpen(false)
              loadApplied()
            } catch (error) {
              console.error('Error submitting application after payment:', error)
              toast.error('Payment successful but application submission failed. Please contact support.')
            }
          }
        }
        const razorpay = new (window as unknown as { Razorpay: new (options: object) => { open: () => void } }).Razorpay(options)
        razorpay.open()
      } else {
        // Free internship application
        const res = await fetch('/api/internships/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            internshipId: selected.id,
            domain: selectedDomain,
            level: selectedLevel,
            coverNote,
            durationWeeks: selectedDuration || undefined,
            // Payment tracking for free internships (all zero values)
            amountPaid: 0,
            originalAmount: 0,
            discountApplied: 0,
            paymentMethod: 'free'
          })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to apply')
        toast.success(`🎉 Application submitted for ${selected.title}!`)
        setApplyOpen(false)
        loadApplied()
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to apply')
    }
  }, [selected, selectedDomain, selectedLevel, coverNote, user?.id, selectedDuration, loadApplied, profile?.is_premium, profile?.premium_expires_at])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold">Internships at Codeunia</h1>
              <p className="text-muted-foreground mt-2">Choose Free or Paid programs. Filter by domain and level.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              <div className="flex items-center gap-2">
                <Label htmlFor="domain">Domain</Label>
                <select id="domain" className="border rounded-md px-3 py-2 bg-background" value={domainFilter} onChange={(e) => setDomainFilter(e.target.value as Domain | 'All')}>
                  {domains.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="level">Level</Label>
                <select id="level" className="border rounded-md px-3 py-2 bg-background" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as Level | 'All')}>
                  {levels.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((i) => (
                <Card key={i.id} className="border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{i.title}</CardTitle>
                      <Badge variant={i.type === 'Paid' ? 'default' : 'secondary'}>{i.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{i.description}</p>
                    {i.type === 'Paid' ? (
                      <div className="text-sm">
                        <span className="font-semibold">Price:</span> 
                        {(() => {
                          const isPremium = profile?.is_premium && profile?.premium_expires_at && 
                            new Date(profile.premium_expires_at) > new Date()
                          
                          if (isPremium) {
                            return (
                              <div className="space-y-1">
                                <div className="text-green-600 font-medium">
                                  ₹350 (4 weeks) / ₹500 (6 weeks) - Premium 50% off! 🎉
                                </div>
                                <div className="text-xs text-muted-foreground line-through">
                                  Regular: ₹699 (4 weeks) / ₹999 (6 weeks)
                                </div>
                              </div>
                            )
                          } else {
                            return ' ₹699 (4 weeks) / ₹999 (6 weeks)'
                          }
                        })()}
                      </div>
                    ) : (
                      <div className="text-sm">
                        <span className="font-semibold">Duration:</span> Choose 4 weeks or 6 weeks
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="text-xs font-medium">What you get</div>
                      <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                        {i.benefits.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {i.domains.map((d) => (
                        <span key={d} className="px-2 py-1 rounded-full bg-muted text-foreground">{d}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {i.levels.map((l) => (
                        <span key={l} className="px-2 py-1 rounded-full bg-muted text-foreground">{l}</span>
                      ))}
                    </div>
                    <div className="pt-2">
                      {appliedIds.includes(i.id) ? (
                        <Button className="w-full" disabled>Applied</Button>
                      ) : i.type === 'Paid' ? (
                        <Button onClick={() => openApply(i)} className="w-full">
                          {(() => {
                            const isPremium = profile?.is_premium && profile?.premium_expires_at && 
                              new Date(profile.premium_expires_at) > new Date()
                            return isPremium ? 'Apply • Pay ₹350/₹500 (Premium)' : 'Apply • Pay ₹699/₹999'
                          })()}
                        </Button>
                      ) : (
                        <Button onClick={() => openApply(i)} className="w-full">Apply • Select Duration</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Apply Dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected ? `Apply: ${selected.title}` : 'Apply'}</DialogTitle>
            <DialogDescription asChild>
              <div>
                Select domain, level, and duration. We will use your profile details for one-click apply.
                {selected && (
                  <div className="mt-3 space-y-1">
                    {selected.type === 'Paid' ? (
                      <div className="text-sm"><span className="font-medium">Price:</span> ₹699 (4 weeks) / ₹999 (6 weeks)</div>
                    ) : (
                      <div className="text-sm"><span className="font-medium">Duration:</span> Choose 4 weeks or 6 weeks</div>
                    )}
                    <div className="text-sm font-medium">What you get</div>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      {selected.benefits.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Domain</Label>
                <select className="mt-1 w-full border rounded-md px-3 py-2 bg-background" value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value as Domain)}>
                  <option value="">Select</option>
                  {selected?.domains.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Level</Label>
                <select className="mt-1 w-full border rounded-md px-3 py-2 bg-background" value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value as Level)}>
                  <option value="">Select</option>
                  {selected?.levels.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Duration</Label>
                <select className="mt-1 w-full border rounded-md px-3 py-2 bg-background" value={selectedDuration || ''} onChange={(e) => setSelectedDuration(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Select duration</option>
                  {selected?.type === 'Paid' ? (
                    // Paid internships with pricing
                    (() => {
                      const isPremium = profile?.is_premium && profile?.premium_expires_at && 
                        new Date(profile.premium_expires_at) > new Date()
                      
                      const price4weeks = isPremium ? 350 : 699 // 50% discount
                      const price6weeks = isPremium ? 500 : 999 // 50% discount (rounded)
                      
                      return (
                        <>
                          <option value="4">
                            4 weeks (₹{price4weeks}{isPremium ? ' - Premium 50% off!' : ''})
                          </option>
                          <option value="6">
                            6 weeks (₹{price6weeks}{isPremium ? ' - Premium 50% off!' : ''})
                          </option>
                        </>
                      )
                    })()
                  ) : (
                    // Free internships without pricing
                    <>
                      <option value="4">4 weeks</option>
                      <option value="6">6 weeks</option>
                    </>
                  )}
                </select>
                {selected?.type === 'Paid' && profile?.is_premium && profile?.premium_expires_at && 
                  new Date(profile.premium_expires_at) > new Date() && (
                  <p className="text-sm text-green-600 mt-1 font-medium">
                    🎉 Premium Member Discount: 50% off applied!
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="cover">Cover note (optional)</Label>
              <Input id="cover" value={coverNote} onChange={(e) => setCoverNote(e.target.value)} placeholder="One line about your interest" />
            </div>

            {!user?.id && (
              <p className="text-sm text-muted-foreground">Please sign in to apply.</p>
            )}

            {user?.id && !profileLoading && !isComplete && (
              <div className="rounded-md border p-3">
                <div className="font-medium mb-2">Complete your profile</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>First name</Label>
                    <Input value={profileDraft.first_name} onChange={(e) => setProfileDraft((s) => ({ ...s, first_name: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Last name</Label>
                    <Input value={profileDraft.last_name} onChange={(e) => setProfileDraft((s) => ({ ...s, last_name: e.target.value }))} />
                  </div>
                  <div>
                    <Label>GitHub URL</Label>
                    <Input value={profileDraft.github_url} onChange={(e) => setProfileDraft((s) => ({ ...s, github_url: e.target.value }))} />
                  </div>
                  <div>
                    <Label>LinkedIn URL</Label>
                    <Input value={profileDraft.linkedin_url} onChange={(e) => setProfileDraft((s) => ({ ...s, linkedin_url: e.target.value }))} />
                  </div>
                </div>
                <div className="mt-3">
                  <Button onClick={handleProfileSave} disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save profile'}</Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button>
              <Button onClick={handleApply}>{selected?.type === 'Paid' ? (selectedDuration === 6 ? 'Pay ₹999' : selectedDuration === 4 ? 'Pay ₹699' : 'Pay') : 'Submit Application'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


