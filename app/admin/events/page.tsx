"use client";

import { useState, useMemo } from "react";
import { Event, eventCategories } from "@/components/data/events";
import { useEvents } from "@/hooks/useEvents";
import { useCreateAdminEvent, useUpdateAdminEvent, useDeleteAdminEvent } from "@/hooks/useAdminEvents";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, Search, RefreshCw } from "lucide-react";

const getEmptyEvent = (): Omit<Event, 'id'> => ({
  slug: "",
  title: "",
  excerpt: "",
  description: "",
  organizer: "",
  organizer_contact: { email: "", phone: "" },
  date: "",
  time: "",
  duration: "",
  category: eventCategories[0],
  categories: [],
  tags: [],
  featured: false,
  image: "",
  location: "",
  locations: [],
  capacity: 0,
  registered: 0,
  price: "",
  payment: "Free",
  status: "live",
  eventType: ["Online"],
  teamSize: 1,
  userTypes: [],
  registration_required: false,
  registration_deadline: "",
  rules: [],
  schedule: [],
  prize: "",
  prize_details: "",
  faq: [],
  socials: {},
  sponsors: [],
  marking_scheme: undefined,
});

export default function AdminEventsPage() {
  // State for search/filter
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<Event | null>(null);
  const [showDelete, setShowDelete] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Omit<Event, 'id'>>(getEmptyEvent());
  const [formError, setFormError] = useState<string | null>(null);

  // --- Add new state for dynamic fields ---
  const [scheduleItems, setScheduleItems] = useState<{ date: string; label: string }[]>([]);
  const [faqItems, setFaqItems] = useState<{ question: string; answer: string }[]>([]);
  const [socials, setSocials] = useState<{ instagram?: string; facebook?: string; twitter?: string; linkedin?: string; website?: string }>({});
  const [sponsorItems, setSponsorItems] = useState<{ name: string; logo: string; type: string }[]>([]);
  const [markingTotal, setMarkingTotal] = useState<number>(0);
  const [markingBreakdown, setMarkingBreakdown] = useState<{ difficulty: string; count: number; marks_each: number }[]>([]);
  const [markingNotes, setMarkingNotes] = useState<string[]>([]);

  // Add new state for input strings
  const [categoriesInput, setCategoriesInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [locationsInput, setLocationsInput] = useState("");
  const [userTypesInput, setUserTypesInput] = useState("");

  // Data hooks
  const { data, loading, error, refetch } = useEvents({ search: searchTerm, category: categoryFilter });
  const { createEvent, loading: creating } = useCreateAdminEvent();
  const { updateEvent, loading: updating } = useUpdateAdminEvent();
  const { deleteEvent, loading: deleting } = useDeleteAdminEvent();

  // Filtered events
  const events = useMemo(() => data?.events || [], [data]);

  // Handlers
  const handleFormChange = (field: keyof typeof formData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  // --- Update openCreate to reset new states ---
  const openCreate = () => {
    setShowCreate(true);
    setFormData(getEmptyEvent());
    setFormError(null);
    setScheduleItems([]);
    setFaqItems([]);
    setSocials({});
    setSponsorItems([]);
    setMarkingTotal(0);
    setMarkingBreakdown([]);
    setMarkingNotes([]);
    setCategoriesInput("");
    setTagsInput("");
    setLocationsInput("");
    setUserTypesInput("");
  };
  const closeCreate = () => {
    setShowCreate(false);
    setFormData(getEmptyEvent());
    setFormError(null);
  };
  const openEdit = (event: Event) => {
    setShowEdit(event);
    setFormData({ ...event });
    setFormError(null);
  };
  const closeEdit = () => {
    setShowEdit(null);
    setFormData(getEmptyEvent());
    setFormError(null);
  };
  const openDelete = (event: Event) => setShowDelete(event);
  const closeDelete = () => setShowDelete(null);

  // Form submit handlers
  // --- Update handleCreate to assemble new fields ---
  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      setFormError("Title and slug are required");
      return;
    }
    try {
      await createEvent({
        ...formData,
        categories: categoriesInput.split(",").map(s => s.trim()).filter(Boolean),
        tags: tagsInput.split(",").map(s => s.trim()).filter(Boolean),
        locations: locationsInput.split(",").map(s => s.trim()).filter(Boolean),
        userTypes: userTypesInput.split(",").map(s => s.trim()).filter(Boolean),
        schedule: scheduleItems,
        faq: faqItems,
        socials,
        sponsors: sponsorItems,
        marking_scheme: markingBreakdown.length || markingNotes.length || markingTotal ? {
          total_marks: markingTotal,
          breakdown: markingBreakdown,
          notes: markingNotes,
        } : undefined,
      });
      closeCreate();
      refetch();
    } catch (err) {
      setFormError((err as Error).message);
    }
  };
  const handleEdit = async () => {
    if (!showEdit) return;
    if (!formData.title.trim() || !formData.slug.trim()) {
      setFormError("Title and slug are required");
      return;
    }
    try {
      await updateEvent(showEdit.slug, formData);
      closeEdit();
      refetch();
    } catch (err) {
      setFormError((err as Error).message);
    }
  };
  const handleDelete = async () => {
    if (!showDelete) return;
    try {
      await deleteEvent(showDelete.slug);
      closeDelete();
      refetch();
    } catch {
      // Optionally show error
    }
  };

  return (
    <div className="space-y-8 md:space-y-14 min-h-screen px-4 py-8 md:px-8 lg:px-16 relative overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-zinc-800/60 relative z-10 mt-2 mb-4">
        <span className="inline-block w-2 h-6 sm:h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full mr-2" />
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white drop-shadow-sm flex items-center gap-3">
            Event Management
          </h1>
          <p className="text-zinc-400 mt-1 font-medium text-sm sm:text-base">Manage and monitor all platform events</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-3">
          <Button variant="outline" className="text-sm" onClick={openCreate}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Event
          </Button>
          <Button variant="outline" className="text-sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {events.length} events
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events by title, excerpt, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40 text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {eventCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-purple-100/80 to-pink-200/60 dark:from-purple-900/60 dark:to-pink-800/40 relative overflow-hidden group">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-zinc-900 dark:text-zinc-100 font-bold flex items-center">
            Events
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-300 font-medium text-sm">
            Search, filter, and manage all events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error Alert */}
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Title</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Category</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Featured</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id} className="hover:bg-purple-700/10 transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {event.title[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate text-zinc-900 dark:text-zinc-100">{event.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{event.excerpt}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{event.category}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{event.date}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{event.status}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{event.featured ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-purple-700/20 text-purple-400 font-semibold text-xs sm:text-sm" onClick={() => openEdit(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-red-700/20 text-red-400 font-semibold text-xs sm:text-sm" onClick={() => openDelete(event)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>Fill in the details to create a new event.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right text-sm">Title</Label>
              <Input id="title" value={formData.title} onChange={e => handleFormChange("title", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right text-sm">Slug</Label>
              <Input id="slug" value={formData.slug} onChange={e => handleFormChange("slug", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Excerpt */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="excerpt" className="text-right text-sm">Excerpt</Label>
              <Input id="excerpt" value={formData.excerpt} onChange={e => handleFormChange("excerpt", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Description */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right text-sm">Description</Label>
              <Textarea id="description" value={formData.description} onChange={e => handleFormChange("description", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Organizer */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="organizer" className="text-right text-sm">Organizer</Label>
              <Input id="organizer" value={formData.organizer} onChange={e => handleFormChange("organizer", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Organizer Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">Organizer Email</Label>
              <Input value={formData.organizer_contact?.email || ""} onChange={e => handleFormChange("organizer_contact", { ...formData.organizer_contact, email: e.target.value })} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">Organizer Phone</Label>
              <Input value={formData.organizer_contact?.phone || ""} onChange={e => handleFormChange("organizer_contact", { ...formData.organizer_contact, phone: e.target.value })} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Date */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right text-sm">Date</Label>
              <Input id="date" type="date" value={formData.date} onChange={e => handleFormChange("date", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Time */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right text-sm">Time</Label>
              <Input id="time" type="time" value={formData.time} onChange={e => handleFormChange("time", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right text-sm">Duration</Label>
              <Input id="duration" value={formData.duration} onChange={e => handleFormChange("duration", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Category */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right text-sm">Category</Label>
              <Select value={formData.category} onValueChange={val => handleFormChange("category", val)}>
                <SelectTrigger className="col-span-1 sm:col-span-3 text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Categories (array) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="categories" className="text-right text-sm">Categories (comma separated)</Label>
              <Input id="categories" value={categoriesInput} onChange={e => setCategoriesInput(e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Tags (array) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right text-sm">Tags (comma separated)</Label>
              <Input id="tags" value={tagsInput} onChange={e => setTagsInput(e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Featured */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="featured" className="text-right text-sm">Featured</Label>
              <Checkbox id="featured" checked={formData.featured} onCheckedChange={val => handleFormChange("featured", !!val)} className="col-span-1 sm:col-span-3" />
            </div>
            {/* Image */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right text-sm">Image URL</Label>
              <Input id="image" value={formData.image} onChange={e => handleFormChange("image", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right text-sm">Location</Label>
              <Input id="location" value={formData.location} onChange={e => handleFormChange("location", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Locations (array) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="locations" className="text-right text-sm">Locations (comma separated)</Label>
              <Input id="locations" value={locationsInput} onChange={e => setLocationsInput(e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right text-sm">Capacity</Label>
              <Input id="capacity" type="number" value={formData.capacity} onChange={e => handleFormChange("capacity", Number(e.target.value))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Registered */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="registered" className="text-right text-sm">Registered</Label>
              <Input id="registered" type="number" value={formData.registered} onChange={e => handleFormChange("registered", Number(e.target.value))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Price */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right text-sm">Price</Label>
              <Input id="price" value={formData.price} onChange={e => handleFormChange("price", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="payment" className="text-right text-sm">Payment</Label>
              <Select value={formData.payment} onValueChange={val => handleFormChange("payment", val)}>
                <SelectTrigger className="col-span-1 sm:col-span-3 text-sm">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Status */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right text-sm">Status</Label>
              <Select value={formData.status} onValueChange={val => handleFormChange("status", val)}>
                <SelectTrigger className="col-span-1 sm:col-span-3 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Event Type (array) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="eventType" className="text-right text-sm">Event Type (comma separated)</Label>
              <Input id="eventType" value={formData.eventType.join(", ")} onChange={e => handleFormChange("eventType", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Team Size (number or range) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="teamSize" className="text-right text-sm">Team Size (number or range, e.g. 1 or 1-5)</Label>
              <Input id="teamSize" value={Array.isArray(formData.teamSize) ? formData.teamSize.join("-") : formData.teamSize} onChange={e => {
                const val = e.target.value;
                if (val.includes("-")) {
                  const [min, max] = val.split("-").map(Number);
                  handleFormChange("teamSize", [min, max]);
                } else {
                  handleFormChange("teamSize", Number(val));
                }
              }} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* User Types (array) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="userTypes" className="text-right text-sm">User Types (comma separated)</Label>
              <Input id="userTypes" value={userTypesInput} onChange={e => setUserTypesInput(e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Registration Required */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="registration_required" className="text-right text-sm">Registration Required</Label>
              <Checkbox id="registration_required" checked={formData.registration_required} onCheckedChange={val => handleFormChange("registration_required", !!val)} className="col-span-1 sm:col-span-3" />
            </div>
            {/* Registration Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="registration_deadline" className="text-right text-sm">Registration Deadline</Label>
              <Input id="registration_deadline" type="date" value={formData.registration_deadline} onChange={e => handleFormChange("registration_deadline", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Rules (array) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="rules" className="text-right text-sm">Rules (one per line)</Label>
              <Textarea id="rules" value={formData.rules?.join("\n") || ""} onChange={e => handleFormChange("rules", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Schedule (dynamic) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4 mb-4">
              <Label className="text-right text-sm pt-2">Schedule</Label>
              <div className="col-span-1 sm:col-span-3 space-y-2">
                {scheduleItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <Input placeholder="Date" value={item.date} onChange={e => setScheduleItems(items => items.map((it, i) => i === idx ? { ...it, date: e.target.value } : it))} className="text-sm w-full sm:w-auto" />
                    <Input placeholder="Label" value={item.label} onChange={e => setScheduleItems(items => items.map((it, i) => i === idx ? { ...it, label: e.target.value } : it))} className="text-sm w-full sm:w-auto" />
                    <Button type="button" variant="destructive" size="icon" onClick={() => setScheduleItems(items => items.filter((_, i) => i !== idx))}>-</Button>
                  </div>
                ))}
                <Button type="button" size="sm" onClick={() => setScheduleItems(items => [...items, { date: '', label: '' }])}>Add Schedule Item</Button>
              </div>
            </div>
            {/* Prize */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="prize" className="text-right text-sm">Prize</Label>
              <Input id="prize" value={formData.prize || ""} onChange={e => handleFormChange("prize", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Prize Details */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="prize_details" className="text-right text-sm">Prize Details</Label>
              <Textarea id="prize_details" value={formData.prize_details || ""} onChange={e => handleFormChange("prize_details", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* FAQ (dynamic) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4 mb-4">
              <Label className="text-right text-sm pt-2">FAQ</Label>
              <div className="col-span-1 sm:col-span-3 space-y-2">
                {faqItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <Input placeholder="Question" value={item.question} onChange={e => setFaqItems(items => items.map((it, i) => i === idx ? { ...it, question: e.target.value } : it))} className="text-sm w-full sm:w-auto" />
                    <Textarea placeholder="Answer" value={item.answer} onChange={e => setFaqItems(items => items.map((it, i) => i === idx ? { ...it, answer: e.target.value } : it))} className="text-sm w-full sm:w-auto" rows={2} />
                    <Button type="button" variant="destructive" size="icon" onClick={() => setFaqItems(items => items.filter((_, i) => i !== idx))}>-</Button>
                  </div>
                ))}
                <Button type="button" size="sm" onClick={() => setFaqItems(items => [...items, { question: '', answer: '' }])}>Add FAQ</Button>
              </div>
            </div>
            {/* Socials (fields) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">Instagram</Label>
              <Input value={socials.instagram || ''} onChange={e => setSocials(s => ({ ...s, instagram: e.target.value }))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">Facebook</Label>
              <Input value={socials.facebook || ''} onChange={e => setSocials(s => ({ ...s, facebook: e.target.value }))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">Twitter</Label>
              <Input value={socials.twitter || ''} onChange={e => setSocials(s => ({ ...s, twitter: e.target.value }))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">LinkedIn</Label>
              <Input value={socials.linkedin || ''} onChange={e => setSocials(s => ({ ...s, linkedin: e.target.value }))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">Website</Label>
              <Input value={socials.website || ''} onChange={e => setSocials(s => ({ ...s, website: e.target.value }))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Sponsors (dynamic) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4 mb-4">
              <Label className="text-right text-sm pt-2">Sponsors</Label>
              <div className="col-span-1 sm:col-span-3 space-y-2">
                {sponsorItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <Input placeholder="Name" value={item.name} onChange={e => setSponsorItems(items => items.map((it, i) => i === idx ? { ...it, name: e.target.value } : it))} className="text-sm w-full sm:w-auto" />
                    <Input placeholder="Logo URL" value={item.logo} onChange={e => setSponsorItems(items => items.map((it, i) => i === idx ? { ...it, logo: e.target.value } : it))} className="text-sm w-full sm:w-auto" />
                    <Input placeholder="Type" value={item.type} onChange={e => setSponsorItems(items => items.map((it, i) => i === idx ? { ...it, type: e.target.value } : it))} className="text-sm w-full sm:w-auto" />
                    <Button type="button" variant="destructive" size="icon" onClick={() => setSponsorItems(items => items.filter((_, i) => i !== idx))}>-</Button>
                  </div>
                ))}
                <Button type="button" size="sm" onClick={() => setSponsorItems(items => [...items, { name: '', logo: '', type: '' }])}>Add Sponsor</Button>
              </div>
            </div>
            {/* Marking Scheme (dynamic) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4 mb-4">
              <Label className="text-right text-sm pt-2">Marking Scheme</Label>
              <div className="col-span-1 sm:col-span-3 space-y-2">
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-2">
                  <Input placeholder="Total Marks" type="number" value={markingTotal} onChange={e => setMarkingTotal(Number(e.target.value))} className="text-sm w-full sm:w-auto" />
                </div>
                <div className="mb-2">
                  <div className="font-semibold text-xs mb-1">Breakdown</div>
                  {markingBreakdown.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-1">
                      <Input placeholder="Difficulty" value={item.difficulty} onChange={e => setMarkingBreakdown(items => items.map((it, i) => i === idx ? { ...it, difficulty: e.target.value } : it))} className="text-sm w-full sm:w-auto" />
                      <Input placeholder="Count" type="number" value={item.count} onChange={e => setMarkingBreakdown(items => items.map((it, i) => i === idx ? { ...it, count: Number(e.target.value) } : it))} className="text-sm w-full sm:w-auto" />
                      <Input placeholder="Marks Each" type="number" value={item.marks_each} onChange={e => setMarkingBreakdown(items => items.map((it, i) => i === idx ? { ...it, marks_each: Number(e.target.value) } : it))} className="text-sm w-full sm:w-auto" />
                      <Button type="button" variant="destructive" size="icon" onClick={() => setMarkingBreakdown(items => items.filter((_, i) => i !== idx))}>-</Button>
                    </div>
                  ))}
                  <Button type="button" size="sm" onClick={() => setMarkingBreakdown(items => [...items, { difficulty: '', count: 0, marks_each: 0 }])}>Add Breakdown</Button>
                </div>
                <div className="mb-2">
                  <div className="font-semibold text-xs mb-1">Notes (one per line)</div>
                  <Textarea value={markingNotes.join("\n")} onChange={e => setMarkingNotes(e.target.value.split("\n").map(s => s.trim()).filter(Boolean))} className="text-sm w-full" rows={2} />
                </div>
              </div>
            </div>
          </div>
          {formError && <div className="text-red-500 mb-2">{formError}</div>}
          <DialogFooter>
            <Button type="button" onClick={handleCreate} disabled={creating}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!showEdit} onOpenChange={val => val ? undefined : closeEdit()}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update the event details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="title-edit" className="text-right text-sm">Title</Label>
              <Input id="title-edit" value={formData.title} onChange={e => handleFormChange("title", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Slug (edit, disabled) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="slug-edit" className="text-right text-sm">Slug</Label>
              <Input id="slug-edit" value={formData.slug} disabled readOnly className="col-span-1 sm:col-span-3 text-sm bg-zinc-900/40 cursor-not-allowed" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="excerpt-edit" className="text-right text-sm">Excerpt</Label>
              <Input id="excerpt-edit" value={formData.excerpt} onChange={e => handleFormChange("excerpt", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="description-edit" className="text-right text-sm">Description</Label>
              <Textarea id="description-edit" value={formData.description} onChange={e => handleFormChange("description", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="organizer-edit" className="text-right text-sm">Organizer</Label>
              <Input id="organizer-edit" value={formData.organizer} onChange={e => handleFormChange("organizer", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="organizer_contact_email-edit" className="text-right text-sm">Organizer Email</Label>
              <Input id="organizer_contact_email-edit" value={formData.organizer_contact?.email || ""} onChange={e => handleFormChange("organizer_contact", { ...formData.organizer_contact, email: e.target.value })} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="organizer_contact_phone-edit" className="text-right text-sm">Organizer Phone</Label>
              <Input id="organizer_contact_phone-edit" value={formData.organizer_contact?.phone || ""} onChange={e => handleFormChange("organizer_contact", { ...formData.organizer_contact, phone: e.target.value })} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="date-edit" className="text-right text-sm">Date</Label>
              <Input id="date-edit" type="date" value={formData.date} onChange={e => handleFormChange("date", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="time-edit" className="text-right text-sm">Time</Label>
              <Input id="time-edit" type="time" value={formData.time} onChange={e => handleFormChange("time", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="duration-edit" className="text-right text-sm">Duration</Label>
              <Input id="duration-edit" value={formData.duration} onChange={e => handleFormChange("duration", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="category-edit" className="text-right text-sm">Category</Label>
              <Select value={formData.category} onValueChange={val => handleFormChange("category", val)}>
                <SelectTrigger className="col-span-1 sm:col-span-3 text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {eventCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="categories-edit" className="text-right text-sm">Categories (comma separated)</Label>
              <Input id="categories-edit" value={formData.categories.join(", ")} onChange={e => handleFormChange("categories", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="tags-edit" className="text-right text-sm">Tags (comma separated)</Label>
              <Input id="tags-edit" value={formData.tags.join(", ")} onChange={e => handleFormChange("tags", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="featured-edit" className="text-right text-sm">Featured</Label>
              <Checkbox id="featured-edit" checked={formData.featured} onCheckedChange={val => handleFormChange("featured", !!val)} className="col-span-1 sm:col-span-3" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="image-edit" className="text-right text-sm">Image URL</Label>
              <Input id="image-edit" value={formData.image} onChange={e => handleFormChange("image", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="location-edit" className="text-right text-sm">Location</Label>
              <Input id="location-edit" value={formData.location} onChange={e => handleFormChange("location", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="locations-edit" className="text-right text-sm">Locations (comma separated)</Label>
              <Input id="locations-edit" value={formData.locations.join(", ")} onChange={e => handleFormChange("locations", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity-edit" className="text-right text-sm">Capacity</Label>
              <Input id="capacity-edit" type="number" value={formData.capacity} onChange={e => handleFormChange("capacity", Number(e.target.value))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="registered-edit" className="text-right text-sm">Registered</Label>
              <Input id="registered-edit" type="number" value={formData.registered} onChange={e => handleFormChange("registered", Number(e.target.value))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="price-edit" className="text-right text-sm">Price</Label>
              <Input id="price-edit" value={formData.price} onChange={e => handleFormChange("price", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="payment-edit" className="text-right text-sm">Payment</Label>
              <Select value={formData.payment} onValueChange={val => handleFormChange("payment", val)}>
                <SelectTrigger className="col-span-1 sm:col-span-3 text-sm">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="status-edit" className="text-right text-sm">Status</Label>
              <Select value={formData.status} onValueChange={val => handleFormChange("status", val)}>
                <SelectTrigger className="col-span-1 sm:col-span-3 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="eventType-edit" className="text-right text-sm">Event Type (comma separated)</Label>
              <Input id="eventType-edit" value={formData.eventType.join(", ")} onChange={e => handleFormChange("eventType", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="teamSize-edit" className="text-right text-sm">Team Size (number or range, e.g. 1 or 1-5)</Label>
              <Input id="teamSize-edit" value={Array.isArray(formData.teamSize) ? formData.teamSize.join("-") : formData.teamSize} onChange={e => {
                const val = e.target.value;
                if (val.includes("-")) {
                  const [min, max] = val.split("-").map(Number);
                  handleFormChange("teamSize", [min, max]);
                } else {
                  handleFormChange("teamSize", Number(val));
                }
              }} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="userTypes-edit" className="text-right text-sm">User Types (comma separated)</Label>
              <Input id="userTypes-edit" value={formData.userTypes.join(", ")} onChange={e => handleFormChange("userTypes", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="registration_required-edit" className="text-right text-sm">Registration Required</Label>
              <Checkbox id="registration_required-edit" checked={formData.registration_required} onCheckedChange={val => handleFormChange("registration_required", !!val)} className="col-span-1 sm:col-span-3" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="registration_deadline-edit" className="text-right text-sm">Registration Deadline</Label>
              <Input id="registration_deadline-edit" type="date" value={formData.registration_deadline} onChange={e => handleFormChange("registration_deadline", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="rules-edit" className="text-right text-sm">Rules (one per line)</Label>
              <Textarea id="rules-edit" value={formData.rules?.join("\n") || ""} onChange={e => handleFormChange("rules", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Schedule (dynamic) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
              <Label className="text-right text-sm pt-2">Schedule</Label>
              <div className="col-span-1 sm:col-span-3 space-y-2">
                {scheduleItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input placeholder="Date" value={item.date} onChange={e => setScheduleItems(items => items.map((it, i) => i === idx ? { ...it, date: e.target.value } : it))} className="text-sm" />
                    <Input placeholder="Label" value={item.label} onChange={e => setScheduleItems(items => items.map((it, i) => i === idx ? { ...it, label: e.target.value } : it))} className="text-sm" />
                    <Button type="button" variant="destructive" size="icon" onClick={() => setScheduleItems(items => items.filter((_, i) => i !== idx))}>-</Button>
                  </div>
                ))}
                <Button type="button" size="sm" onClick={() => setScheduleItems(items => [...items, { date: '', label: '' }])}>Add Schedule Item</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="prize-edit" className="text-right text-sm">Prize</Label>
              <Input id="prize-edit" value={formData.prize || ""} onChange={e => handleFormChange("prize", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="prize_details-edit" className="text-right text-sm">Prize Details</Label>
              <Textarea id="prize_details-edit" value={formData.prize_details || ""} onChange={e => handleFormChange("prize_details", e.target.value)} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* FAQ (dynamic) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
              <Label className="text-right text-sm pt-2">FAQ</Label>
              <div className="col-span-1 sm:col-span-3 space-y-2">
                {faqItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input placeholder="Question" value={item.question} onChange={e => setFaqItems(items => items.map((it, i) => i === idx ? { ...it, question: e.target.value } : it))} className="text-sm" />
                    <Input placeholder="Answer" value={item.answer} onChange={e => setFaqItems(items => items.map((it, i) => i === idx ? { ...it, answer: e.target.value } : it))} className="text-sm" />
                    <Button type="button" variant="destructive" size="icon" onClick={() => setFaqItems(items => items.filter((_, i) => i !== idx))}>-</Button>
                  </div>
                ))}
                <Button type="button" size="sm" onClick={() => setFaqItems(items => [...items, { question: '', answer: '' }])}>Add FAQ</Button>
              </div>
            </div>
            {/* Socials (fields) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">Instagram</Label>
              <Input value={socials.instagram || ''} onChange={e => setSocials(s => ({ ...s, instagram: e.target.value }))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">Facebook</Label>
              <Input value={socials.facebook || ''} onChange={e => setSocials(s => ({ ...s, facebook: e.target.value }))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">Twitter</Label>
              <Input value={socials.twitter || ''} onChange={e => setSocials(s => ({ ...s, twitter: e.target.value }))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">LinkedIn</Label>
              <Input value={socials.linkedin || ''} onChange={e => setSocials(s => ({ ...s, linkedin: e.target.value }))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm">Website</Label>
              <Input value={socials.website || ''} onChange={e => setSocials(s => ({ ...s, website: e.target.value }))} className="col-span-1 sm:col-span-3 text-sm" />
            </div>
            {/* Sponsors (dynamic) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
              <Label className="text-right text-sm pt-2">Sponsors</Label>
              <div className="col-span-1 sm:col-span-3 space-y-2">
                {sponsorItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input placeholder="Name" value={item.name} onChange={e => setSponsorItems(items => items.map((it, i) => i === idx ? { ...it, name: e.target.value } : it))} className="text-sm" />
                    <Input placeholder="Logo URL" value={item.logo} onChange={e => setSponsorItems(items => items.map((it, i) => i === idx ? { ...it, logo: e.target.value } : it))} className="text-sm" />
                    <Input placeholder="Type" value={item.type} onChange={e => setSponsorItems(items => items.map((it, i) => i === idx ? { ...it, type: e.target.value } : it))} className="text-sm" />
                    <Button type="button" variant="destructive" size="icon" onClick={() => setSponsorItems(items => items.filter((_, i) => i !== idx))}>-</Button>
                  </div>
                ))}
                <Button type="button" size="sm" onClick={() => setSponsorItems(items => [...items, { name: '', logo: '', type: '' }])}>Add Sponsor</Button>
              </div>
            </div>
            {/* Marking Scheme (dynamic) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-4">
              <Label className="text-right text-sm pt-2">Marking Scheme</Label>
              <div className="col-span-1 sm:col-span-3 space-y-2">
                {markingBreakdown.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input placeholder="Difficulty" value={item.difficulty} onChange={e => setMarkingBreakdown(items => items.map((it, i) => i === idx ? { ...it, difficulty: e.target.value } : it))} className="text-sm" />
                    <Input placeholder="Count" type="number" value={item.count} onChange={e => setMarkingBreakdown(items => items.map((it, i) => i === idx ? { ...it, count: Number(e.target.value) } : it))} className="text-sm" />
                    <Input placeholder="Marks Each" type="number" value={item.marks_each} onChange={e => setMarkingBreakdown(items => items.map((it, i) => i === idx ? { ...it, marks_each: Number(e.target.value) } : it))} className="text-sm" />
                    <Button type="button" variant="destructive" size="icon" onClick={() => setMarkingBreakdown(items => items.filter((_, i) => i !== idx))}>-</Button>
                  </div>
                ))}
                <Button type="button" size="sm" onClick={() => setMarkingBreakdown(items => [...items, { difficulty: '', count: 0, marks_each: 0 }])}>Add Breakdown</Button>
              </div>
            </div>
          </div>
          {formError && <div className="text-red-500 mb-2">{formError}</div>}
          <DialogFooter>
            <Button type="button" onClick={handleEdit} disabled={updating}>Update Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!showDelete} onOpenChange={val => val ? undefined : closeDelete()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>Are you sure you want to delete this event?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-zinc-900 dark:text-zinc-100 font-medium">{showDelete?.title}</p>
            <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
