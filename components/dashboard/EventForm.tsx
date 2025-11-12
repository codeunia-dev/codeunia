'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Event } from '@/types/events'
import { Company } from '@/types/company'
import { Save, Send, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface EventFormProps {
  company: Company
  event?: Event
  mode: 'create' | 'edit'
  onSuccess?: (event: Event) => void
}

export function EventForm({ company, event, mode, onSuccess }: EventFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: event?.title || '',
    slug: event?.slug || '',
    excerpt: event?.excerpt || '',
    description: event?.description || '',
    organizer: event?.organizer || company.name,
    date: event?.date || '',
    time: event?.time || '',
    duration: event?.duration || '',
    category: event?.category || '',
    location: event?.location || '',
    capacity: event?.capacity || 0,
    price: event?.price || 'Free',
    payment: event?.payment || 'Not Required',
    registration_required: event?.registration_required ?? true,
    registration_deadline: event?.registration_deadline || '',
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (submitForApproval: boolean = false) => {
    try {
      setLoading(true)

      // Validation
      if (!formData.title || !formData.excerpt || !formData.description) {
        toast.error('Please fill in all required fields')
        return
      }

      if (!formData.date || !formData.time || !formData.duration) {
        toast.error('Please provide event date, time, and duration')
        return
      }

      if (!formData.category || !formData.location) {
        toast.error('Please select category and location')
        return
      }

      // Generate slug from title if not provided
      const slug = formData.slug || formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const eventData = {
        ...formData,
        slug,
        categories: [formData.category],
        tags: [],
        locations: [formData.location],
        registered: event?.registered || 0,
        event_type: ['Offline'],
        user_types: ['Professionals', 'College Students'],
        featured: false,
        status: submitForApproval ? 'published' : 'draft',
        rules: [],
        schedule: [],
        faq: [],
        socials: {},
        sponsors: [],
        company_id: company.id,
      }

      let response
      if (mode === 'edit' && event) {
        // Update existing event
        response = await fetch(`/api/events/${event.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        })
      } else {
        // Create new event
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save event')
      }

      const data = await response.json()

      // If submitting for approval, call the submit endpoint
      if (submitForApproval && data.event) {
        const submitResponse = await fetch(`/api/events/${data.event.slug}/submit`, {
          method: 'POST',
        })

        if (!submitResponse.ok) {
          toast.warning('Event saved but failed to submit for approval')
        } else {
          toast.success('Event submitted for approval!')
        }
      } else {
        toast.success(mode === 'edit' ? 'Event updated successfully!' : 'Event created as draft!')
      }

      if (onSuccess && data.event) {
        onSuccess(data.event)
      }
    } catch (error) {
      console.error('Error saving event:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save event')
    } finally {
      setLoading(false)
    }
  }

  const canSubmitForApproval = () => {
    // Check if all required fields are filled
    return formData.title && formData.excerpt && formData.description &&
           formData.date && formData.time && formData.duration &&
           formData.category && formData.location
  }

  return (
    <div className="space-y-6">
      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            This event will be associated with {company.name}
          </CardDescription>
        </CardHeader>
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
      </Card>

      {/* Event rejection reason */}
      {event?.approval_status === 'rejected' && event.rejection_reason && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Event Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{event.rejection_reason}</p>
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Provide the essential details about your event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter event title"
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
                placeholder="Brief description of the event (shown in listings)"
                rows={2}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detailed description of the event"
                rows={6}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            When and where will the event take place?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="time">Time *</Label>
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
                placeholder="e.g., 2 hours"
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
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Meetup">Meetup</SelectItem>
                  <SelectItem value="Webinar">Webinar</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Seminar">Seminar</SelectItem>
                  <SelectItem value="Networking">Networking</SelectItem>
                  <SelectItem value="Tech Talk">Tech Talk</SelectItem>
                  <SelectItem value="Career Fair">Career Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Event location or Online"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="organizer">Organizer</Label>
              <Input
                id="organizer"
                value={formData.organizer}
                onChange={(e) => handleChange('organizer', e.target.value)}
                placeholder="Event organizer name"
              />
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
        </CardContent>
      </Card>

      {/* Registration & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Registration & Pricing</CardTitle>
          <CardDescription>
            Configure registration and pricing details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
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
        </CardContent>
      </Card>

      {/* Actions */}
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
