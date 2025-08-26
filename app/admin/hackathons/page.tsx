"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Hackathon } from "@/lib/services/hackathons"
import { apiFetch } from "@/lib/api-fetch"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Trophy,
  Eye,
  MoreHorizontal,
  Download
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

const statusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  live: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-300",
  published: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-300"
}

export default function AdminHackathons() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingHackathon, setEditingHackathon] = useState<Hackathon | null>(null)
  const [formData, setFormData] = useState<Partial<Hackathon>>({
    title: "",
    slug: "",
    excerpt: "",
    description: "",
    organizer: "",
    organizer_contact: {
      email: "",
      phone: ""
    },
    date: "",
    time: "",
    duration: "",
    registration_deadline: "",
    category: "",
    categories: [],
    tags: [],
    featured: false,
    image: "",
    location: "",
    locations: [],
    capacity: 0,
    registered: 0,
    team_size: {
      min: 1,
      max: 4
    },
    user_types: [],
    price: "Free",
    payment: "Not Required",
    status: "draft",
    event_type: [],
    registration_required: true,
    rules: [],
    schedule: [] as { date: string; label: string }[], // Array of { date: string, label: string }
    prize: "",
    prize_details: "",
    faq: [] as { question: string; answer: string }[], // Array of { question: string, answer: string }
    socials: {
      linkedin: "",
      whatsapp: "",
      instagram: ""
    },
    sponsors: []
  })

  const fetchHackathons = async () => {
    try {
      setLoading(true)
      // Use relative URL to work with any port
      const response = await apiFetch('/api/admin/hackathons?limit=100', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please log in to access hackathons")
        } else if (response.status === 404) {
          toast.error("Hackathons API not found")
        } else {
          throw new Error(`Failed to fetch hackathons: ${response.status}`)
        }
        // Set empty array to prevent errors
        setHackathons([])
        return
      }
      const data = await response.json()
      setHackathons(data.hackathons || [])
    } catch (error) {
      toast.error("Failed to fetch hackathons")
      console.error('Fetch error:', error)
      // Set empty array to prevent errors
      setHackathons([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHackathons()
  }, [])

  const handleDelete = async (slug: string) => {
    if (confirm('Are you sure you want to delete this hackathon?')) {
      try {
        const response = await apiFetch(`/api/admin/hackathons?slug=${slug}`, {
          method: 'DELETE'
        })
        if (!response.ok) {
          throw new Error('Failed to delete hackathon')
        }
        toast.success("Hackathon deleted successfully")
        fetchHackathons()
      } catch (error) {
        toast.error("Failed to delete hackathon")
        console.error(error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const scheduleObj = Array.isArray(formData.schedule)
        ? Object.fromEntries(formData.schedule.filter(item => item.date && item.label).map(item => [item.date, item.label]))
        : {};
      const faqObj = Array.isArray(formData.faq)
        ? Object.fromEntries(formData.faq.filter(item => item.question && item.answer).map(item => [item.question, item.answer]))
        : {};

      if (editingHackathon) {
        const response = await apiFetch('/api/admin/hackathons', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            slug: editingHackathon.slug,
            data: { ...formData, schedule: scheduleObj, faq: faqObj }
          })
        })
        if (!response.ok) {
          throw new Error('Failed to update hackathon')
        }
        toast.success("Hackathon updated successfully")
        setEditingHackathon(null)
      } else {
        const response = await apiFetch('/api/admin/hackathons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...formData, schedule: scheduleObj, faq: faqObj })
        })
        if (!response.ok) {
          throw new Error('Failed to create hackathon')
        }
        toast.success("Hackathon created successfully")
      }
      setIsCreateDialogOpen(false)
      resetForm()
      fetchHackathons()
    } catch (error) {
      toast.error(editingHackathon ? "Failed to update hackathon" : "Failed to create hackathon")
      console.error(error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      description: "",
      organizer: "",
      organizer_contact: {
        email: "",
        phone: ""
      },
      date: "",
      time: "",
      duration: "",
      registration_deadline: "",
      category: "",
      categories: [],
      tags: [],
      featured: false,
      image: "",
      location: "",
      locations: [],
      capacity: 0,
      registered: 0,
      team_size: {
        min: 1,
        max: 4
      },
      user_types: [],
      price: "Free",
      payment: "Not Required",
      status: "draft",
      event_type: [],
      registration_required: true,
      rules: [],
      schedule: [] as { date: string; label: string }[],
      faq: [] as { question: string; answer: string }[],
      prize: "",
      prize_details: "",
      socials: {
        linkedin: "",
        whatsapp: "",
        instagram: ""
      },
      sponsors: []
    })
  }

  const handleEdit = (hackathon: Hackathon) => {
    setEditingHackathon(hackathon)
    setFormData({
      ...hackathon,
      organizer_contact: {
        email: hackathon.organizer_contact?.email || "",
        phone: hackathon.organizer_contact?.phone || ""
      },
      team_size: hackathon.team_size || { min: 1, max: 4 },
      socials: hackathon.socials || {
        linkedin: "",
        whatsapp: "",
        instagram: ""
      },
      schedule: (hackathon.schedule && typeof hackathon.schedule === 'object' && !Array.isArray(hackathon.schedule)
        ? Object.entries(hackathon.schedule).map(([date, label]) => ({ date, label: String(label) }))
        : []) as { date: string; label: string }[],
      faq: (hackathon.faq && typeof hackathon.faq === 'object' && !Array.isArray(hackathon.faq)
        ? Object.entries(hackathon.faq).map(([question, answer]) => ({ question, answer: String(answer) }))
        : []) as { question: string; answer: string }[],
      sponsors: Array.isArray(hackathon.sponsors) ? hackathon.sponsors : []
    })
    setIsCreateDialogOpen(true)
  }

  const generateSlug = (title: string) => {
    // Only generate new slug if title is changed
    if (!editingHackathon || title !== editingHackathon.title) {
      return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    }
    // Return existing slug if title hasn't changed
    return editingHackathon?.slug || title
  }

  const filteredHackathons = hackathons.filter(hackathon => {
    const matchesSearch = hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hackathon.organizer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || hackathon.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: hackathons.length,
    featured: hackathons.filter(h => h.featured).length
  }

  const handleSponsorChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const sponsors = Array.isArray(prev.sponsors) ? [...prev.sponsors] : [];
      sponsors[index] = { ...sponsors[index], [field]: value };
      return { ...prev, sponsors };
    });
  };

  const handleAddSponsor = () => {
    setFormData(prev => ({
      ...prev,
      sponsors: Array.isArray(prev.sponsors) ? [...prev.sponsors, { logo: '', name: '', type: '' }] : [{ logo: '', name: '', type: '' }]
    }));
  };

  const handleRemoveSponsor = (index: number) => {
    setFormData(prev => {
      const sponsors = Array.isArray(prev.sponsors) ? [...prev.sponsors] : [];
      sponsors.splice(index, 1);
      return { ...prev, sponsors };
    });
  };

  return (
    <div className="space-y-8 md:space-y-14 min-h-screen px-4 py-8 md:px-8 lg:px-16 relative overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-zinc-800/60 relative z-10 mt-2 mb-4">
        <span className="inline-block w-2 h-6 sm:h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full mr-2" />
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white drop-shadow-sm flex items-center gap-3">
            Hackathons Management
          </h1>
          <p className="text-zinc-400 mt-1 font-medium text-sm sm:text-base">Manage all hackathons, events and competitions</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-3">
          <Button variant="outline" className="text-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Hackathon
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingHackathon ? 'Edit Hackathon' : 'Create New Hackathon'}</DialogTitle>
                <DialogDescription>
                  {editingHackathon ? 'Update the hackathon details below.' : 'Fill in the details to create a new hackathon.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => {
                        const title = e.target.value
                        setFormData(prev => ({ 
                          ...prev, 
                          title,
                          slug: generateSlug(title)
                        }))
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                {/* Organizer Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizer">Organizer</Label>
                    <Input
                      id="organizer"
                      value={formData.organizer}
                      onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.organizer_contact?.email}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        organizer_contact: { 
                          ...prev.organizer_contact,
                          email: e.target.value
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input
                      id="phone"
                      value={formData.organizer_contact?.phone}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        organizer_contact: { 
                          ...prev.organizer_contact,
                          phone: e.target.value
                        }
                      }))}
                    />
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 48 hours"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration_deadline">Registration Deadline</Label>
                  <Input
                    id="registration_deadline"
                    type="date"
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, registration_deadline: e.target.value }))}
                  />
                </div>

                {/* Location and Capacity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Primary Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locations">Additional Locations (comma-separated)</Label>
                    <Input
                      id="locations"
                      value={formData.locations?.join(', ')}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        locations: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }))}
                      placeholder="Online, New York, San Francisco"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="0"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registered">Registered Count</Label>
                    <Input
                      id="registered"
                      type="number"
                      min="0"
                      value={formData.registered}
                      onChange={(e) => setFormData(prev => ({ ...prev, registered: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                {/* Categories and Tags */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Primary Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Technology, Healthcare"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categories">Categories (comma-separated)</Label>
                    <Input
                      id="categories"
                      value={formData.categories?.join(', ')}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        categories: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }))}
                      placeholder="AI, Web Development, Mobile"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags?.join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="hackathon, coding, competition"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_type">Event Types (comma-separated)</Label>
                  <Input
                    id="event_type"
                    value={formData.event_type?.join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      event_type: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="in-person, virtual, hybrid"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user_types">User Types (comma-separated)</Label>
                  <Input
                    id="user_types"
                    value={formData.user_types?.join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      user_types: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    placeholder="students, professionals, beginners"
                  />
                </div>

                {/* Team Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="team_min">Min Team Size</Label>
                    <Input
                      id="team_min"
                      type="number"
                      min="1"
                      value={formData.team_size?.min || 1}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        team_size: { 
                          ...prev.team_size, 
                          min: parseInt(e.target.value) || 1 
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team_max">Max Team Size</Label>
                    <Input
                      id="team_max"
                      type="number"
                      min="1"
                      value={formData.team_size?.max || 4}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        team_size: { 
                          ...prev.team_size, 
                          max: parseInt(e.target.value) || 4 
                        }
                      }))}
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="Free, $50, $100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment">Payment Info</Label>
                    <Input
                      id="payment"
                      value={formData.payment}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment: e.target.value }))}
                      placeholder="Not Required, Stripe, PayPal"
                    />
                  </div>
                </div>

                {/* Prize Information */}
                <div className="space-y-2">
                  <Label htmlFor="prize">Prize</Label>
                  <Input
                    id="prize"
                    value={formData.prize}
                    onChange={(e) => setFormData(prev => ({ ...prev, prize: e.target.value }))}
                    placeholder="$10,000 in total prizes"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prize_details">Prize Details</Label>
                  <Textarea
                    id="prize_details"
                    value={formData.prize_details}
                    onChange={(e) => setFormData(prev => ({ ...prev, prize_details: e.target.value }))}
                    rows={3}
                    placeholder="1st Place: $5000, 2nd Place: $3000, 3rd Place: $2000"
                  />
                </div>

                {/* Rules */}
                <div className="space-y-2">
                  <Label htmlFor="rules">Rules (comma-separated)</Label>
                  <Textarea
                    id="rules"
                    value={formData.rules?.join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      rules: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    rows={3}
                    placeholder="Team size 1-4, Original code only, No external APIs"
                  />
                </div>

                {/* Schedule */}
                <div className="space-y-2">
                  <Label>Schedule</Label>
                  {Array.isArray(formData.schedule) && formData.schedule.length > 0 && (
                    <div className="space-y-2">
                      {formData.schedule.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-2 items-end">
                          <Input
                            placeholder="Date"
                            value={item.date}
                            onChange={e => setFormData(prev => {
                              const schedule = Array.isArray(prev.schedule) ? [...prev.schedule] : [];
                              schedule[idx] = { ...schedule[idx], date: e.target.value };
                              return { ...prev, schedule };
                            })}
                          />
                          <Input
                            placeholder="Label"
                            value={item.label}
                            onChange={e => setFormData(prev => {
                              const schedule = Array.isArray(prev.schedule) ? [...prev.schedule] : [];
                              schedule[idx] = { ...schedule[idx], label: e.target.value };
                              return { ...prev, schedule };
                            })}
                          />
                          <Button type="button" variant="destructive" onClick={() => setFormData(prev => {
                            const schedule = Array.isArray(prev.schedule) ? [...prev.schedule] : [];
                            schedule.splice(idx, 1);
                            return { ...prev, schedule };
                          })}>-</Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button type="button" size="sm" onClick={() => setFormData(prev => ({
                    ...prev,
                    schedule: Array.isArray(prev.schedule) ? [...prev.schedule, { date: '', label: '' }] : [{ date: '', label: '' }]
                  }))}>
                    Add Schedule Item
                  </Button>
                </div>

                {/* FAQ */}
                <div className="space-y-2">
                  <Label>FAQ</Label>
                  {Array.isArray(formData.faq) && formData.faq.length > 0 && (
                    <div className="space-y-2">
                      {formData.faq.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-2 gap-2 items-end">
                          <Input
                            placeholder="Question"
                            value={item.question}
                            onChange={e => setFormData(prev => {
                              const faq = Array.isArray(prev.faq) ? [...prev.faq] : [];
                              faq[idx] = { ...faq[idx], question: e.target.value };
                              return { ...prev, faq };
                            })}
                          />
                          <Input
                            placeholder="Answer"
                            value={item.answer}
                            onChange={e => setFormData(prev => {
                              const faq = Array.isArray(prev.faq) ? [...prev.faq] : [];
                              faq[idx] = { ...faq[idx], answer: e.target.value };
                              return { ...prev, faq };
                            })}
                          />
                          <Button type="button" variant="destructive" onClick={() => setFormData(prev => {
                            const faq = Array.isArray(prev.faq) ? [...prev.faq] : [];
                            faq.splice(idx, 1);
                            return { ...prev, faq };
                          })}>-</Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button type="button" size="sm" onClick={() => setFormData(prev => ({
                    ...prev,
                    faq: Array.isArray(prev.faq) ? [...prev.faq, { question: '', answer: '' }] : [{ question: '', answer: '' }]
                  }))}>
                    Add FAQ
                  </Button>
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.socials?.linkedin}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        socials: { 
                          ...prev.socials, 
                          linkedin: e.target.value 
                        }
                      }))}
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.socials?.whatsapp}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        socials: { 
                          ...prev.socials, 
                          whatsapp: e.target.value 
                        }
                      }))}
                      placeholder="https://wa.me/1234567890 or +1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.socials?.instagram}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        socials: { 
                          ...prev.socials, 
                          instagram: e.target.value 
                        }
                      }))}
                      placeholder="@hackathon2024 or https://instagram.com/..."
                    />
                  </div>
                </div>

                {/* Status and Options */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'live' | 'cancelled' | 'completed' }))}>  
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Options</Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="featured"
                          checked={formData.featured}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked as boolean }))}
                        />
                        <Label htmlFor="featured" className="text-sm">Featured</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="registration"
                          checked={formData.registration_required}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, registration_required: checked as boolean }))}
                        />
                        <Label htmlFor="registration" className="text-sm">Registration Required</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sponsors Section */}
                <div className="space-y-2">
                  <Label>Sponsors</Label>
                  {Array.isArray(formData.sponsors) && formData.sponsors.length > 0 && (
                    <div className="space-y-4">
                      {formData.sponsors.map((sponsor, idx) => (
                        <div key={idx} className="grid grid-cols-4 gap-2 items-end border p-2 rounded-md bg-muted">
                          <div className="space-y-1">
                            <Label>Logo URL</Label>
                            <Input
                              value={sponsor.logo}
                              onChange={e => handleSponsorChange(idx, 'logo', e.target.value)}
                              placeholder="/images/sponsors/example.png"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Name</Label>
                            <Input
                              value={sponsor.name}
                              onChange={e => handleSponsorChange(idx, 'name', e.target.value)}
                              placeholder="Sponsor Name"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Type</Label>
                            <Input
                              value={sponsor.type}
                              onChange={e => handleSponsorChange(idx, 'type', e.target.value)}
                              placeholder="e.g., Technology Partner"
                            />
                          </div>
                          <Button type="button" variant="destructive" onClick={() => handleRemoveSponsor(idx)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button type="button" size="sm" onClick={handleAddSponsor}>
                    Add Sponsor
                  </Button>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false)
                    setEditingHackathon(null)
                    resetForm()
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingHackathon ? 'Update' : 'Create'} Hackathon
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredHackathons.length} hackathons
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hackathons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.featured}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search hackathons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Hackathons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Hackathons ({filteredHackathons.length})</CardTitle>
          <CardDescription>
            Manage all your hackathons and competitions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredHackathons.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hackathons found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "Get started by creating your first hackathon"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHackathons.map(hackathon => (
                  <TableRow key={hackathon.slug}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{hackathon.title}</span>
                        <span className="text-sm text-gray-500 truncate max-w-xs">{hackathon.excerpt}</span>
                      </div>
                    </TableCell>
                    <TableCell>{hackathon.organizer}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(hackathon.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="truncate max-w-24">{hackathon.location || 'TBD'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[hackathon.status]}>
                        {hackathon.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {hackathon.featured && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          <Trophy className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(`/hackathons/${hackathon.slug}`, '_blank')}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(hackathon)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(hackathon.slug)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

