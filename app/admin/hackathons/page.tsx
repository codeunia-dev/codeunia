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
  published: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-300"
}

export default function AdminHackathons() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingHackathon, setEditingHackathon] = useState<Hackathon | null>(null)
  const [formData, setFormData] = useState<Partial<Hackathon>>({
    title: "",
    slug: "",
    excerpt: "",
    description: "",
    organizer: "",
    date: "",
    time: "",
    location: "",
    status: "draft",
    featured: false,
    registration_required: true,
    categories: [],
    tags: [],
    locations: [],
    user_types: [],
    organizer_contact: {
      email: "",
      phone: ""
    }
  })

  const fetchHackathons = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/hackathons?limit=100')
      if (!response.ok) {
        throw new Error('Failed to fetch hackathons')
      }
      const data = await response.json()
      setHackathons(data.hackathons)
    } catch (error) {
      toast.error("Failed to fetch hackathons")
      console.error(error)
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
        const response = await fetch(`/api/admin/hackathons?slug=${slug}`, {
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
      if (editingHackathon) {
        const response = await fetch('/api/admin/hackathons', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            slug: editingHackathon.slug,
            data: formData
          })
        })
        if (!response.ok) {
          throw new Error('Failed to update hackathon')
        }
        toast.success("Hackathon updated successfully")
        setEditingHackathon(null)
      } else {
        const response = await fetch('/api/admin/hackathons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
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
      date: "",
      time: "",
      location: "",
      status: "draft",
      featured: false,
      registration_required: true,
      categories: [],
      tags: [],
      locations: [],
      user_types: [],
      organizer_contact: {
        email: "",
        phone: ""
      }
    })
  }

  const handleEdit = (hackathon: Hackathon) => {
    setEditingHackathon(hackathon)
    setFormData({
      ...hackathon,
      organizer_contact: {
        email: hackathon.organizer_contact?.email || "",
        phone: hackathon.organizer_contact?.phone || ""
      }
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
    published: hackathons.filter(h => h.status === 'published').length,
    draft: hackathons.filter(h => h.status === 'draft').length,
    featured: hackathons.filter(h => h.featured).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Hackathons Management</h1>
          <p className="text-gray-400 mt-1">Manage all hackathons, events and competitions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
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
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingHackathon ? 'Edit Hackathon' : 'Create New Hackathon'}</DialogTitle>
                <DialogDescription>
                  {editingHackathon ? 'Update the hackathon details below.' : 'Fill in the details to create a new hackathon.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                          email: e.target.value,
                          phone: prev.organizer_contact?.phone || ""
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
                          email: prev.organizer_contact?.email || "",
                          phone: e.target.value
                        }
                      }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'draft' | 'published' | 'cancelled' | 'completed' }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
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

