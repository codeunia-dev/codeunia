'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Hackathon } from '@/types/hackathons'
import { Company } from '@/types/company'
import { Save, Send, AlertCircle, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

interface HackathonFormProps {
  company: Company
  hackathon?: Hackathon
  mode: 'create' | 'edit'
  onSuccess?: (hackathon: Hackathon) => void
}

export function HackathonForm({ company, hackathon, mode, onSuccess }: HackathonFormProps) {
  const [loading, setLoading] = useState(false)
  const [companyInfoOpen, setCompanyInfoOpen] = useState(false)
  
  // Parse existing data for dynamic fields
  const parseSchedule = (schedule: unknown): { date: string; label: string }[] => {
    if (Array.isArray(schedule)) return schedule
    if (schedule && typeof schedule === 'object') {
      return Object.entries(schedule).map(([date, label]) => ({ date, label: String(label) }))
    }
    return []
  }

  const parseFAQ = (faq: unknown): { question: string; answer: string }[] => {
    if (Array.isArray(faq)) return faq
    if (faq && typeof faq === 'object') {
      return Object.entries(faq).map(([question, answer]) => ({ question, answer: String(answer) }))
    }
    return []
  }

  const [formData, setFormData] = useState({
    title: hackathon?.title || '',
    slug: hackathon?.slug || '',
    excerpt: hackathon?.excerpt || '',
    description: hackathon?.description || '',
    organizer: hackathon?.organizer || company.name,
    date: hackathon?.date || '',
    time: hackathon?.time || '',
    duration: hackathon?.duration || '',
    category: hackathon?.category || '',
    location: hackathon?.location || '',
    capacity: hackathon?.capacity || 0,
    price: hackathon?.price || 'Free',
    payment: hackathon?.payment || 'Not Required',
    registration_required: hackathon?.registration_required ?? true,
    registration_deadline: hackathon?.registration_deadline || '',
    prize: hackathon?.prize || '',
    prize_details: hackathon?.prize_details || '',
    team_size_min: (hackathon?.team_size as { min?: number; max?: number } | undefined)?.min || 1,
    team_size_max: (hackathon?.team_size as { min?: number; max?: number } | undefined)?.max || 5,
    // High priority fields
    image: hackathon?.image || '',
    tags: hackathon?.tags?.join(', ') || '',
    event_type: hackathon?.event_type?.[0] || 'Offline',
    user_types: hackathon?.user_types || [],
    organizer_email: (hackathon?.organizer_contact as { email?: string })?.email || '',
    organizer_phone: (hackathon?.organizer_contact as { phone?: string })?.phone || '',
  })

  // Medium priority fields - dynamic arrays
  const [rules, setRules] = useState<string[]>(
    Array.isArray(hackathon?.rules) ? hackathon.rules : []
  )
  const [schedule, setSchedule] = useState<{ date: string; label: string }[]>(
    parseSchedule(hackathon?.schedule)
  )
  const [faq, setFAQ] = useState<{ question: string; answer: string }[]>(
    parseFAQ(hackathon?.faq)
  )
  const [socials, setSocials] = useState({
    linkedin: (hackathon?.socials as Record<string, string> | undefined)?.linkedin || '',
    twitter: (hackathon?.socials as Record<string, string> | undefined)?.twitter || '',
    discord: (hackathon?.socials as Record<string, string> | undefined)?.discord || '',
    website: (hackathon?.socials as Record<string, string> | undefined)?.website || '',
    whatsapp: (hackathon?.socials as Record<string, string> | undefined)?.whatsapp || '',
    instagram: (hackathon?.socials as Record<string, string> | undefined)?.instagram || '',
  })

  const handleChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (submitForApproval: boolean = false) => {
    try {
      setLoading(true)

      if (!formData.title || !formData.excerpt || !formData.description) {
        toast.error('Please fill in all required fields')
        return
      }

      if (!formData.date || !formData.time || !formData.duration) {
        toast.error('Please provide hackathon date, time, and duration')
        return
      }

      if (!formData.category || !formData.location) {
        toast.error('Please select category and location')
        return
      }

      const slug = formData.slug || formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Remove team_size_min, team_size_max, and other UI-only fields from formData before spreading
      const { team_size_min, team_size_max, tags, organizer_email, organizer_phone, user_types, event_type, ...restFormData } = formData

      const hackathonData = {
        ...restFormData,
        slug,
        categories: [formData.category],
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        locations: [formData.location],
        registered: hackathon?.registered || 0,
        event_type: [event_type],
        user_types: user_types.length > 0 ? user_types : ['Professionals', 'College Students'],
        featured: false,
        status: 'draft',
        rules: rules.filter(Boolean),
        schedule: schedule.filter(s => s.date && s.label),
        faq: faq.filter(f => f.question && f.answer),
        socials: Object.fromEntries(
          Object.entries(socials).filter(([, value]) => value)
        ),
        sponsors: [],
        company_id: company.id,
        team_size: {
          min: team_size_min,
          max: team_size_max,
        },
        organizer_contact: {
          email: organizer_email || undefined,
          phone: organizer_phone || undefined,
        },
        views: hackathon?.views || 0,
        clicks: hackathon?.clicks || 0,
        approval_status: 'draft',
        is_codeunia_event: false,
      }

      let response
      if (mode === 'edit' && hackathon) {
        response = await fetch(`/api/hackathons/${hackathon.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hackathonData),
        })
      } else {
        response = await fetch('/api/hackathons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hackathonData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save hackathon')
      }

      const data = await response.json()

      // If submitting for approval, call the submit endpoint
      if (submitForApproval && data.hackathon) {
        const submitResponse = await fetch(`/api/hackathons/${data.hackathon.slug}/submit`, {
          method: 'POST',
        })

        if (!submitResponse.ok) {
          toast.warning('Hackathon saved but failed to submit for approval')
        } else {
          toast.success('Hackathon submitted for approval!')
        }
      } else {
        toast.success(mode === 'edit' ? 'Hackathon updated successfully!' : 'Hackathon created as draft!')
      }

      if (onSuccess && data.hackathon) {
        onSuccess(data.hackathon)
      }
    } catch (error) {
      console.error('Error saving hackathon:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save hackathon')
    } finally {
      setLoading(false)
    }
  }

  const canSubmitForApproval = () => {
    return formData.title && formData.excerpt && formData.description &&
           formData.date && formData.time && formData.duration &&
           formData.category && formData.location
  }

  return (
    <div className="space-y-6">
      <Collapsible open={companyInfoOpen} onOpenChange={setCompanyInfoOpen}>
        <Card className="dark:bg-black dark:border-gray-800">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    This hackathon will be associated with {company.name}
                  </CardDescription>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${companyInfoOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="flex items-center gap-3">
                {company.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">{company.name}</p>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Verified
                  </Badge>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {hackathon?.approval_status === 'rejected' && hackathon.rejection_reason && (
        <Card className="border-red-500/20 bg-red-500/5 dark:bg-black dark:border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Hackathon Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{hackathon.rejection_reason}</p>
          </CardContent>
        </Card>
      )}

      <Card className="dark:bg-black dark:border-gray-800">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Provide the essential details about your hackathon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Hackathon Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter hackathon title"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="auto-generated from title"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to auto-generate from title
              </p>
            </div>

            <div className="col-span-2">
              <Label htmlFor="excerpt">Short Description *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
                placeholder="Brief description of the hackathon"
                rows={2}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detailed description of the hackathon"
                rows={6}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="image">Banner Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => handleChange('image', e.target.value)}
                placeholder="https://example.com/banner.jpg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended size: 1200x600px
              </p>
            </div>

            <div className="col-span-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="AI, ML, Web3, Blockchain (comma-separated)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate tags with commas for better discoverability
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-black dark:border-gray-800">
        <CardHeader>
          <CardTitle>Hackathon Details</CardTitle>
          <CardDescription>
            When and where will the hackathon take place?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Start Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time">Start Time *</Label>
              <Input
                id="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                placeholder="e.g., 10:00 AM"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                placeholder="e.g., 48 hours"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Web Development">Web Development</SelectItem>
                  <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                  <SelectItem value="AI/ML">AI/ML</SelectItem>
                  <SelectItem value="Blockchain">Blockchain</SelectItem>
                  <SelectItem value="IoT">IoT</SelectItem>
                  <SelectItem value="Game Development">Game Development</SelectItem>
                  <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                  <SelectItem value="Open Innovation">Open Innovation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Hackathon location or Online"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_type">Event Type *</Label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => handleChange('event_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Offline">Offline</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 0)}
                placeholder="Maximum participants"
              />
            </div>
          </div>

          <div className="col-span-2">
            <Label>Target Audience *</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['Students', 'Professionals', 'College Students', 'School Students', 'Working Professionals', 'Freelancers'].map((type) => (
                <Badge
                  key={type}
                  variant={formData.user_types.includes(type) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    const newTypes = formData.user_types.includes(type)
                      ? formData.user_types.filter(t => t !== type)
                      : [...formData.user_types, type]
                    handleChange('user_types', newTypes)
                  }}
                >
                  {type}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Click to select/deselect target audience types
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-black dark:border-gray-800">
        <CardHeader>
          <CardTitle>Organizer Contact</CardTitle>
          <CardDescription>
            Contact information for participants to reach out
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organizer">Organizer Name</Label>
              <Input
                id="organizer"
                value={formData.organizer}
                onChange={(e) => handleChange('organizer', e.target.value)}
                placeholder="Organizer name"
              />
            </div>
            <div>
              <Label htmlFor="organizer_email">Contact Email</Label>
              <Input
                id="organizer_email"
                type="email"
                value={formData.organizer_email}
                onChange={(e) => handleChange('organizer_email', e.target.value)}
                placeholder="contact@example.com"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="organizer_phone">Contact Phone</Label>
            <Input
              id="organizer_phone"
              type="tel"
              value={formData.organizer_phone}
              onChange={(e) => handleChange('organizer_phone', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-black dark:border-gray-800">
        <CardHeader>
          <CardTitle>Team & Prizes</CardTitle>
          <CardDescription>
            Configure team size and prize details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="team_size_min">Min Team Size</Label>
              <Input
                id="team_size_min"
                type="number"
                value={formData.team_size_min}
                onChange={(e) => handleChange('team_size_min', parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="team_size_max">Max Team Size</Label>
              <Input
                id="team_size_max"
                type="number"
                value={formData.team_size_max}
                onChange={(e) => handleChange('team_size_max', parseInt(e.target.value) || 5)}
                placeholder="5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prize">Prize Pool</Label>
              <Input
                id="prize"
                value={formData.prize}
                onChange={(e) => handleChange('prize', e.target.value)}
                placeholder="e.g., ₹1,00,000"
              />
            </div>
            <div>
              <Label htmlFor="registration_deadline">Registration Deadline</Label>
              <Input
                id="registration_deadline"
                type="date"
                value={formData.registration_deadline}
                onChange={(e) => handleChange('registration_deadline', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="prize_details">Prize Details</Label>
            <Textarea
              id="prize_details"
              value={formData.prize_details}
              onChange={(e) => handleChange('prize_details', e.target.value)}
              placeholder="Describe prize distribution (1st, 2nd, 3rd place, etc.)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-black dark:border-gray-800">
        <CardHeader>
          <CardTitle>Registration & Pricing</CardTitle>
          <CardDescription>
            Configure registration and pricing details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Entry Fee</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="e.g., Free, ₹500"
              />
            </div>
            <div>
              <Label htmlFor="payment">Payment Type</Label>
              <Select
                value={formData.payment}
                onValueChange={(value) => handleChange('payment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Required">Not Required</SelectItem>
                  <SelectItem value="Required">Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Links */}
      <Card className="dark:bg-black dark:border-gray-800">
        <CardHeader>
          <CardTitle>Social Media & Links</CardTitle>
          <CardDescription>
            Add social media links for participants to connect
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={socials.linkedin}
                onChange={(e) => setSocials(prev => ({ ...prev, linkedin: e.target.value }))}
                placeholder="https://linkedin.com/company/..."
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input
                id="twitter"
                value={socials.twitter}
                onChange={(e) => setSocials(prev => ({ ...prev, twitter: e.target.value }))}
                placeholder="https://twitter.com/..."
              />
            </div>
            <div>
              <Label htmlFor="discord">Discord</Label>
              <Input
                id="discord"
                value={socials.discord}
                onChange={(e) => setSocials(prev => ({ ...prev, discord: e.target.value }))}
                placeholder="https://discord.gg/..."
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={socials.website}
                onChange={(e) => setSocials(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={socials.whatsapp}
                onChange={(e) => setSocials(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="https://wa.me/..."
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={socials.instagram}
                onChange={(e) => setSocials(prev => ({ ...prev, instagram: e.target.value }))}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules */}
      <Card className="dark:bg-black dark:border-gray-800">
        <CardHeader>
          <CardTitle>Rules & Guidelines</CardTitle>
          <CardDescription>
            Add rules for participants to follow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rules.map((rule, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={rule}
                onChange={(e) => {
                  const newRules = [...rules]
                  newRules[index] = e.target.value
                  setRules(newRules)
                }}
                placeholder={`Rule ${index + 1}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRules(rules.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setRules([...rules, ''])}
          >
            Add Rule
          </Button>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card className="dark:bg-black dark:border-gray-800">
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>
            Add schedule items for the hackathon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {schedule.map((item, index) => (
            <div key={index} className="grid grid-cols-3 gap-2">
              <Input
                value={item.date}
                onChange={(e) => {
                  const newSchedule = [...schedule]
                  newSchedule[index].date = e.target.value
                  setSchedule(newSchedule)
                }}
                placeholder="Day 1 - Morning"
              />
              <Input
                value={item.label}
                onChange={(e) => {
                  const newSchedule = [...schedule]
                  newSchedule[index].label = e.target.value
                  setSchedule(newSchedule)
                }}
                placeholder="Activity description"
                className="col-span-2"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSchedule(schedule.filter((_, i) => i !== index))}
                className="col-span-3"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setSchedule([...schedule, { date: '', label: '' }])}
          >
            Add Schedule Item
          </Button>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="dark:bg-black dark:border-gray-800">
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
          <CardDescription>
            Add frequently asked questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faq.map((item, index) => (
            <div key={index} className="space-y-2 p-4 border rounded-lg">
              <Input
                value={item.question}
                onChange={(e) => {
                  const newFAQ = [...faq]
                  newFAQ[index].question = e.target.value
                  setFAQ(newFAQ)
                }}
                placeholder="Question"
              />
              <Textarea
                value={item.answer}
                onChange={(e) => {
                  const newFAQ = [...faq]
                  newFAQ[index].answer = e.target.value
                  setFAQ(newFAQ)
                }}
                placeholder="Answer"
                rows={2}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFAQ(faq.filter((_, i) => i !== index))}
              >
                Remove FAQ
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setFAQ([...faq, { question: '', answer: '' }])}
          >
            Add FAQ
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          * Required fields
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={loading || !canSubmitForApproval()}
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </div>
      </div>
    </div>
  )
}
