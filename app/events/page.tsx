"use client" 

import { useState, useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Clock, ArrowRight, Calendar, Star, Users, MapPin, DollarSign, Filter, Link as LinkIcon, Sparkles } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { mockEvents, Event } from "@/components/data/events"
import Header from "@/components/header";
import Footer from "@/components/footer";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import "keen-slider/keen-slider.min.css"
import { useKeenSlider } from "keen-slider/react"
import { cn } from "@/lib/utils";

// Event categories for dropdown
const eventCategories = [
  "All",
  "Hackathons",
  "Workshops", 
  "Conferences",
  "Webinars",
  "Mentorship Programs",
  "Career Fairs",
  "Tech Talks",
  "Coding Competitions",
  "Project Showcases"
];

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [dateFilter] = useState("Upcoming")
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([])
  const [selectedTeamSizes, setSelectedTeamSizes] = useState<string[]>([])
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null)

  // Unique values for filters
  const allStatuses = ["Live", "Expired", "Closed", "Recent"]
  const allLocations = Array.from(new Set(events.flatMap(e => e.locations))).sort()
  const allEventTypes = ["Online", "Offline"]
  const allTeamSizes = ["1", "2", "2+", "3+", "4+", "5+"]
  const allPayments = ["Paid", "Free"]
  const allUserTypes = ["Professionals", "Startups", "School Students", "College Students", "Fresher", "MBA Students"]
  const allCategories = Array.from(new Set(events.flatMap(e => e.categories))).sort()

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    // Multi-select filters: if none selected, always match
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(capitalize(event.status))
    const matchesLocation = selectedLocations.length === 0 || event.locations.some(loc => selectedLocations.includes(loc))
    const matchesEventType = selectedEventTypes.length === 0 || event.eventType.some(type => selectedEventTypes.includes(type))
    const matchesTeamSize = selectedTeamSizes.length === 0 || selectedTeamSizes.some(size => {
      if (typeof event.teamSize === 'number') return size === String(event.teamSize)
      if (Array.isArray(event.teamSize)) {
        if (size.endsWith('+')) return event.teamSize[1] >= parseInt(size)
        return event.teamSize[0] <= parseInt(size) && event.teamSize[1] >= parseInt(size)
      }
      return false
    })
    const matchesPayment = selectedPayments.length === 0 || selectedPayments.includes(event.payment)
    const matchesUserType = selectedUserTypes.length === 0 || event.userTypes.some(u => selectedUserTypes.includes(u))
    const matchesCategory = selectedCategories.length === 0 || event.categories.some(cat => selectedCategories.includes(cat))
    const matchesDate = isDateMatch(event)
    const matchesDropdownCategory = selectedCategory === "All" || event.category === selectedCategory

    return matchesSearch && matchesStatus && matchesLocation && matchesEventType && matchesTeamSize && matchesPayment && matchesUserType && matchesCategory && matchesDate && matchesDropdownCategory
  })

  const featuredEvents = filteredEvents.filter((event) => event.featured)
  const regularEvents = filteredEvents.filter((event) => !event.featured)

  // Add keen-slider hook for featured events with autoplay and navigation
  const realSliderRef = useRef<HTMLDivElement>(null)
  const sliderTimer = useRef<NodeJS.Timeout | null>(null)
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    slides: { perView: 1.2, spacing: 24 },
    breakpoints: {
      "(min-width: 640px)": { slides: { perView: 1.5, spacing: 24 } },
      "(min-width: 1024px)": { slides: { perView: 2.2, spacing: 32 } },
    },
    loop: featuredEvents.length > 1,
  })

  // Autoplay effect
  useEffect(() => {
    if (!slider) return
    if (featuredEvents.length > 1) {
      const autoplay = () => {
        slider.current?.next()
      }
      sliderTimer.current = setInterval(autoplay, 3500)
      // Pause on hover
      const sliderEl = realSliderRef.current
      if (sliderEl) {
        const pause = () => sliderTimer.current && clearInterval(sliderTimer.current)
        const resume = () => { sliderTimer.current = setInterval(autoplay, 3500) }
        sliderEl.addEventListener("mouseenter", pause)
        sliderEl.addEventListener("mouseleave", resume)
        return () => {
          sliderEl.removeEventListener("mouseenter", pause)
          sliderEl.removeEventListener("mouseleave", resume)
        }
      }
      return () => {
        if (sliderTimer.current) clearInterval(sliderTimer.current)
      }
    } else {
      // If less than 2, clear any existing interval
      if (sliderTimer.current) clearInterval(sliderTimer.current)
    }
  }, [slider, featuredEvents.length])

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      
      // For now, using mock data since events table doesn't exist yet
      // In a real app, this would fetch from Supabase
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setEvents(mockEvents)
      } catch {
        setEvents([])
      }
      setIsLoading(false)
    }
    fetchEvents()
  }, [])

  // Date filter logic
  function isDateMatch(event: Event) {
    const today = new Date();
    const eventDate = new Date(event.date);
    if (dateFilter === "All") return true;
    if (dateFilter === "Today") {
      return eventDate.toDateString() === today.toDateString();
    }
    if (dateFilter === "This Week") {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return eventDate >= weekStart && eventDate <= weekEnd;
    }
    // Default: Upcoming
    return eventDate >= today;
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Hackathons":
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
      case "Workshops":
        return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
      case "Conferences":
        return "bg-gradient-to-r from-purple-500 to-violet-600 text-white"
      case "Webinars":
        return "bg-gradient-to-r from-red-500 to-pink-600 text-white"
      case "Career Fairs":
        return "bg-gradient-to-r from-orange-500 to-amber-600 text-white"
      case "Tech Talks":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "Coding Competitions":
        return "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
      case "Project Showcases":
        return "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
      case "Mentorship Programs":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-600 text-white"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
      case "ongoing":
        return "bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
      case "completed":
        return "bg-gradient-to-r from-gray-500 to-slate-600 text-white"
      case "cancelled":
        return "bg-gradient-to-r from-red-500 to-pink-600 text-white"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-600 text-white"
    }
  }

  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Helper to copy event link
  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/events/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedEventId(id)
    setTimeout(() => setCopiedEventId(null), 1500)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/10">
       <Header/>
      
      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
                <div
                    className={cn(
                        "absolute inset-0",
                        "[background-size:20px_20px]",
                        "[background-image:linear-gradient(to_right,rgba(99,102,241,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.8)_1px,transparent_1px)]",
                        "dark:[background-image:linear-gradient(to_right,rgba(139,92,246,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.8)_1px,transparent_1px)]"
                    )}
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 animate-gradient"></div>
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
                    <div
                        className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"
                        style={{ animationDelay: "2s" }}
                    ></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="container px-4 mx-auto relative z-10"
                >
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex flex-col items-center justify-center gap-4">
                                <button className="bg-slate-800 no-underline group relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block cursor-default">
                                    <span className="absolute inset-0 overflow-hidden rounded-full">
                                        <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    </span>
                                    <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                                        <span>Events & Opportunities </span>
                                        <span>
                                            <Sparkles className="w-3 h-3" />
                                        </span>
                                    </div>
                                    <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                                </button>
                            </div>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-5xl md:text-6xl font-bold tracking-tight leading-tight"
                        >
                            Discover, Participate{" "}
                            <motion.span
                                className="gradient-text inline-block"
                                animate={{
                                    backgroundPosition: [
                                        "0% 50%",
                                        "100% 50%",
                                        "0% 50%",
                                    ],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                style={{
                                    background:
                                        "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)",
                                    backgroundSize: "300% 100%",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                Grow
                            </motion.span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                        >
                            Find your next hackathon, workshop, or tech event. Unlock new skills, connect with peers, and win exciting prizes!
                        </motion.p>
                    </div>
                </motion.div>
            </section>

      {/* Search and Filters - Redesigned */}
      <section className="py-8 bg-gradient-to-b from-muted/30 to-background relative border-b border-primary/10">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search events by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-12 shadow-lg border-2 focus:border-primary/50 transition-all duration-300 bg-background/80 backdrop-blur-sm rounded-xl"
              />
            </div>
            {/* Filters Button */}
            <Button variant="outline" className="flex items-center gap-2" onClick={() => setFilterOpen(true)}>
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </div>

          {/* Category Dropdown */}
          <div className="mt-4 w-full max-w-xs">
            <label htmlFor="category-select" className="block text-sm font-medium text-muted-foreground mb-1">Event Category</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background/80 shadow focus:border-primary focus:ring-2 focus:ring-primary/20 text-base"
            >
              {eventCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Active Filter Chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedStatuses.map(status => (
              <Badge key={status} className="flex items-center gap-1 bg-primary/10 text-primary">
                {status}
                <button onClick={() => setSelectedStatuses(selectedStatuses.filter(s => s !== status))} className="ml-1">×</button>
              </Badge>
            ))}
            {selectedLocations.map(loc => (
              <Badge key={loc} className="flex items-center gap-1 bg-primary/10 text-primary">
                {loc}
                <button onClick={() => setSelectedLocations(selectedLocations.filter(l => l !== loc))} className="ml-1">×</button>
              </Badge>
            ))}
            {selectedEventTypes.map(type => (
              <Badge key={type} className="flex items-center gap-1 bg-primary/10 text-primary">
                {type}
                <button onClick={() => setSelectedEventTypes(selectedEventTypes.filter(t => t !== type))} className="ml-1">×</button>
              </Badge>
            ))}
            {selectedTeamSizes.map(size => (
              <Badge key={size} className="flex items-center gap-1 bg-primary/10 text-primary">
                {size}
                <button onClick={() => setSelectedTeamSizes(selectedTeamSizes.filter(s => s !== size))} className="ml-1">×</button>
              </Badge>
            ))}
            {selectedPayments.map(pay => (
              <Badge key={pay} className="flex items-center gap-1 bg-primary/10 text-primary">
                {pay}
                <button onClick={() => setSelectedPayments(selectedPayments.filter(p => p !== pay))} className="ml-1">×</button>
              </Badge>
            ))}
            {selectedUserTypes.map(user => (
              <Badge key={user} className="flex items-center gap-1 bg-primary/10 text-primary">
                {user}
                <button onClick={() => setSelectedUserTypes(selectedUserTypes.filter(u => u !== user))} className="ml-1">×</button>
              </Badge>
            ))}
            {selectedCategories.map(cat => (
              <Badge key={cat} className="flex items-center gap-1 bg-primary/10 text-primary">
                {cat}
                <button onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== cat))} className="ml-1">×</button>
              </Badge>
            ))}
            {(selectedStatuses.length || selectedLocations.length || selectedEventTypes.length || selectedTeamSizes.length || selectedPayments.length || selectedUserTypes.length || selectedCategories.length) > 0 && (
              <Button size="sm" variant="ghost" onClick={() => {
                setSelectedStatuses([]); setSelectedLocations([]); setSelectedEventTypes([]); setSelectedTeamSizes([]); setSelectedPayments([]); setSelectedUserTypes([]); setSelectedCategories([]);
              }}>Clear All</Button>
            )}
          </div>

          {/* Filter Modal/Sidebar */}
          <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
            <DialogContent className="max-w-lg w-full rounded-2xl shadow-2xl border-0 bg-background/95">
              <div className="max-h-[70vh] overflow-y-auto pr-2">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-extrabold text-primary mb-4">Filters</DialogTitle>
                </DialogHeader>
                {/* Status */}
                <div className="mb-4 border-b border-muted/30 pb-4 mb-4">
                  <div className="font-semibold text-base text-muted-foreground mb-2">Status</div>
                  <div className="flex flex-wrap gap-2">
                    {allStatuses.map(status => (
                      <label className="flex items-center gap-2 cursor-pointer" key={status}>
                        <Checkbox checked={selectedStatuses.includes(status)} onCheckedChange={checked => {
                          setSelectedStatuses(checked ? [...selectedStatuses, status] : selectedStatuses.filter(s => s !== status))
                        }} />
                        <span className="ml-2">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Location */}
                <div className="mb-4 border-b border-muted/30 pb-4 mb-4">
                  <div className="font-semibold text-base text-muted-foreground mb-2">Location</div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {allLocations.map(loc => (
                      <label className="flex items-center gap-2 cursor-pointer" key={loc}>
                        <Checkbox checked={selectedLocations.includes(loc)} onCheckedChange={checked => {
                          setSelectedLocations(checked ? [...selectedLocations, loc] : selectedLocations.filter(l => l !== loc))
                        }} />
                        <span className="ml-2">{loc}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Event Type */}
                <div className="mb-4 border-b border-muted/30 pb-4 mb-4">
                  <div className="font-semibold text-base text-muted-foreground mb-2">Event Type</div>
                  <div className="flex flex-wrap gap-2">
                    {allEventTypes.map(type => (
                      <label className="flex items-center gap-2 cursor-pointer" key={type}>
                        <Checkbox checked={selectedEventTypes.includes(type)} onCheckedChange={checked => {
                          setSelectedEventTypes(checked ? [...selectedEventTypes, type] : selectedEventTypes.filter(t => t !== type))
                        }} />
                        <span className="ml-2">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Team Size */}
                <div className="mb-4 border-b border-muted/30 pb-4 mb-4">
                  <div className="font-semibold text-base text-muted-foreground mb-2">Team Size</div>
                  <div className="flex flex-wrap gap-2">
                    {allTeamSizes.map(size => (
                      <label className="flex items-center gap-2 cursor-pointer" key={size}>
                        <Checkbox checked={selectedTeamSizes.includes(size)} onCheckedChange={checked => {
                          setSelectedTeamSizes(checked ? [...selectedTeamSizes, size] : selectedTeamSizes.filter(s => s !== size))
                        }} />
                        <span className="ml-2">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Payment */}
                <div className="mb-4 border-b border-muted/30 pb-4 mb-4">
                  <div className="font-semibold text-base text-muted-foreground mb-2">Payment</div>
                  <div className="flex flex-wrap gap-2">
                    {allPayments.map(pay => (
                      <label className="flex items-center gap-2 cursor-pointer" key={pay}>
                        <Checkbox checked={selectedPayments.includes(pay)} onCheckedChange={checked => {
                          setSelectedPayments(checked ? [...selectedPayments, pay] : selectedPayments.filter(p => p !== pay))
                        }} />
                        <span className="ml-2">{pay}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* User Type */}
                <div className="mb-4 border-b border-muted/30 pb-4 mb-4">
                  <div className="font-semibold text-base text-muted-foreground mb-2">User Type</div>
                  <div className="flex flex-wrap gap-2">
                    {allUserTypes.map(user => (
                      <label className="flex items-center gap-2 cursor-pointer" key={user}>
                        <Checkbox checked={selectedUserTypes.includes(user)} onCheckedChange={checked => {
                          setSelectedUserTypes(checked ? [...selectedUserTypes, user] : selectedUserTypes.filter(u => u !== user))
                        }} />
                        <span className="ml-2">{user}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Category */}
                <div className="mb-4 border-b border-muted/30 pb-4 mb-4">
                  <div className="font-semibold text-base text-muted-foreground mb-2">Category</div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {allCategories.map(cat => (
                      <label className="flex items-center gap-2 cursor-pointer" key={cat}>
                        <Checkbox checked={selectedCategories.includes(cat)} onCheckedChange={checked => {
                          setSelectedCategories(checked ? [...selectedCategories, cat] : selectedCategories.filter(c => c !== cat))
                        }} />
                        <span className="ml-2">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <DialogClose asChild>
                  <Button className="w-full mt-2" onClick={() => setFilterOpen(false)}>Apply Filters</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Featured Events - Redesigned */}
      {featuredEvents.length > 0 && (
        <section className="py-16 relative">
          <div className="container px-4 mx-auto relative">
            <motion.div 
              className="text-center space-y-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-full px-4 py-2 text-sm font-medium">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Featured Events</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Don&apos;t Miss These <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Highlights</span>
              </h2>
            </motion.div>

            {/* Carousel Navigation Arrows - Responsive for mobile */}
            {/* Desktop: floating side arrows; Mobile: centered below slider */}
            <div className="hidden sm:block">
              <button
                aria-label="Previous featured event"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-primary/80 text-primary hover:text-white rounded-full shadow-lg p-2 transition-colors"
                style={{ marginLeft: '-1.5rem' }}
                onClick={() => slider.current?.prev()}
                tabIndex={0}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button
                aria-label="Next featured event"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-primary/80 text-primary hover:text-white rounded-full shadow-lg p-2 transition-colors"
                style={{ marginRight: '-1.5rem' }}
                onClick={() => slider.current?.next()}
                tabIndex={0}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
            {/* Mobile: arrows below slider, centered */}
            <div className="flex sm:hidden justify-center gap-8 mt-4">
              <button
                aria-label="Previous featured event"
                className="bg-background/90 hover:bg-primary/80 text-primary hover:text-white rounded-full shadow-lg p-4 transition-colors text-2xl"
                onClick={() => slider.current?.prev()}
                tabIndex={0}
              >
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 28 11 16 21 4"></polyline></svg>
              </button>
              <button
                aria-label="Next featured event"
                className="bg-background/90 hover:bg-primary/80 text-primary hover:text-white rounded-full shadow-lg p-4 transition-colors text-2xl"
                onClick={() => slider.current?.next()}
                tabIndex={0}
              >
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 28 21 16 11 4"></polyline></svg>
              </button>
            </div>

            {/* Keen-slider carousel */}
            <div
              ref={node => {
                realSliderRef.current = node;
                sliderRef(node);
              }}
              className="keen-slider"
            >
              {(featuredEvents.length > 2 ? [...featuredEvents, ...featuredEvents] : featuredEvents).map((event, index) => (
                <motion.div
                  key={event.id + '-' + index}
                  className="keen-slider__slide"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    {/* Event Image */}
                    <div className="h-48 relative overflow-hidden">
                      {event.image ? (
                        <Image
                          src={event.image}
                          alt={event.title || 'Event image'}
                          fill
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          priority={index < 2}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-muted to-muted/50">
                          <Calendar className="h-16 w-16 text-muted-foreground opacity-40" />
                        </div>
                      )}
                      {/* Overlay Badges removed from here */}
                    </div>
                    <CardHeader className="relative z-10 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-xl hover:text-primary cursor-pointer transition-colors group-hover:scale-105 transform duration-300 flex-1">
                          {event.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleCopyLink(event.slug, String (event.id))}
                            className="p-1 bg-background/80 rounded-full border border-primary/20 hover:bg-primary/10 transition-colors"
                            title="Copy event link"
                          >
                            <LinkIcon className="h-4 w-4 text-primary" />
                          </button>
                          {copiedEventId === String (event.id) && (
                            <span className="text-xs text-primary bg-background/90 px-2 py-1 rounded shadow">Link copied!</span>
                          )}
                        </div>
                      </div>
                      {/* Overlay Badges moved below title */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className={`${getCategoryColor(event.category)} shadow-lg`} variant="secondary">
                          {event.category}
                        </Badge>
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                        <Badge className={`${getStatusColor(event.status)} shadow-lg`} variant="secondary">
                          {event.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm leading-relaxed min-h-[48px] max-h-[48px] overflow-hidden line-clamp-2">
                        {event.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 pt-0">
                      {/* Event Meta */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {event.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                      {/* Registration Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{event.registered}/{event.capacity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{event.price}</span>
                          </div>
                        </div>
                        <Button
                          variant="default"
                          size="lg"
                          className="
                            font-semibold 
                            px-4 py-2 
                            text-sm 
                            rounded-full 
                            bg-gradient-to-r from-primary to-purple-600 
                            hover:from-primary/90 hover:to-purple-600/90 
                            shadow-lg 
                            transition-transform duration-200 
                            transform-gpu hover:scale-105 
                            focus:ring-2 focus:ring-primary/40 
                            w-full sm:w-fit
                            text-center
                            max-w-full
                          "
                          asChild
                        >
                          <Link
                            href={`/events/${event.slug}`}
                            className="flex items-center justify-center whitespace-nowrap"
                          >
                            Apply Now <ArrowRight className="ml-1 h-4 w-4 flex-shrink-0" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Events - Redesigned */}
      <section className="py-16 bg-gradient-to-b from-muted/30 to-background relative">
        <div className="container px-4 mx-auto">
          <motion.div 
            className="flex items-center justify-between mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                <span>All Events</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Browse <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">All Events</span>
              </h2>
            </div>
            <div className="text-sm text-muted-foreground font-medium bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
              {regularEvents.length} events found
            </div>
          </motion.div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {regularEvents.map((event, index) => (
              <motion.div
                key={event.id}
                className="flex h-full"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="flex flex-col h-full group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
                  {/* Event Image/Logo */}
                  <div className="h-32 w-full relative flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 border-b border-primary/10">
                    {event.image ? (
                      <Image
                        src={event.image}
                        alt={event.title || 'Event image'}
                        fill
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        priority={index < 6}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Calendar className="h-12 w-12 text-muted-foreground opacity-40" />
                      </div>
                    )}
                    {/* Event Type Badge */}
                    <div className="absolute top-2 left-2 flex gap-1 z-10">
                      <Badge className={`${getCategoryColor(event.category)} shadow-lg text-xs`} variant="secondary">
                        {event.category}
                      </Badge>
                    </div>
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
                      <Badge className={`${getStatusColor(event.status)} shadow-lg text-xs`} variant="secondary">
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                  {/* Card Content */}
                  <div className="flex-1 flex flex-col p-4">
                    {/* Title and Organizer */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {event.organizer
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-base truncate hover:text-primary transition-colors cursor-pointer flex-1">
                            {event.title}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleCopyLink(event.slug, String(event.id))}
                              className="p-1 bg-background/80 rounded-full border border-primary/20 hover:bg-primary/10 transition-colors"
                              title="Copy event link"
                            >
                              <LinkIcon className="h-4 w-4 text-primary" />
                            </button>
                            {copiedEventId === String(event.id) && (
                              <span className="text-xs text-primary bg-background/90 px-2 py-1 rounded shadow">Link copied!</span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{event.organizer}</div>
                      </div>
                    </div>
                    {/* Description/Excerpt */}
                    <div className="text-xs text-muted-foreground mb-2 line-clamp-2">{event.excerpt}</div>
                    {/* Meta Row */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.registered}/{event.capacity}
                      </div>
                    </div>
                    {/* Registration Deadline */}
                    <div className="flex items-center gap-1 text-xs text-orange-600 mb-2">
                      <Clock className="h-3 w-3" />
                      Reg. Deadline: {new Date(event.registration_deadline).toLocaleDateString()}
                    </div>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {event.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xxs bg-background/50 backdrop-blur-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {/* Action Button */}
                    <div className="mt-auto pt-2 flex justify-end">
                      <Button
                        variant="default"
                        size="lg"
                        className="font-semibold px-6 py-2 rounded-full text-base bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg transition-transform duration-200 transform-gpu hover:scale-105 focus:ring-2 focus:ring-primary/40"
                        asChild
                      >
                        <Link href={`/events/${event.slug}`}>
                          Apply Now <ArrowRight className="ml-1 h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {regularEvents.length === 0 && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 animate-pulse"></div>
                <Calendar className="h-16 w-16 text-muted-foreground relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No events found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Try adjusting your search terms or browse different categories.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                }}
                className="glow-effect hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-purple-600"
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      <Footer/>
    </div>
  )
}
