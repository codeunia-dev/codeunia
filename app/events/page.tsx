"use client" 

import { useState, useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Clock, ArrowRight, Calendar, Users, MapPin, DollarSign, Link as LinkIcon, Sparkles, Building2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Event } from "@/lib/services/events"
import Header from "@/components/header";
import Footer from "@/components/footer";
import Image from "next/image";
import "keen-slider/keen-slider.min.css"
import { useKeenSlider } from "keen-slider/react"
import { cn } from "@/lib/utils";
import { useEvents, useFeaturedEvents } from "@/hooks/useEvents"
import { CompanyBadge } from "@/components/companies/CompanyBadge"
import type { Company } from "@/types/company"

// Event categories for dropdown
const eventCategories = [
  "All",
  "Workshop",
  "Conference", 
  "Meetup",
  "Webinar",
  "Training",
  "Seminar",
  "Networking",
  "Tech Talk",
  "Career Fair"
];

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter] = useState("All")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [selectedCompany, setSelectedCompany] = useState<string>("All")
  const [selectedIndustry, setSelectedIndustry] = useState<string>("All")
  const [selectedCompanySize, setSelectedCompanySize] = useState<string>("All")
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [industries, setIndustries] = useState<string[]>([])
  const [companySizes] = useState<string[]>(['startup', 'small', 'medium', 'large', 'enterprise'])

  // Use custom hooks for data fetching
  const { data: eventsData, loading: eventsLoading, error: eventsError } = useEvents({
    search: searchTerm,
    category: selectedCategory,
    dateFilter: dateFilter === "Upcoming" ? "upcoming" : dateFilter === "All" ? "all" : "all",
    company_id: selectedCompany !== "All" ? selectedCompany : undefined,
    company_industry: selectedIndustry !== "All" ? selectedIndustry : undefined,
    company_size: selectedCompanySize !== "All" ? selectedCompanySize : undefined
  })

  const { loading: featuredLoading } = useFeaturedEvents(5)

  // Fetch companies for filter
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies?limit=100')
        if (response.ok) {
          const data = await response.json()
          setCompanies(data.companies || [])
          
          // Extract unique industries from companies
          const uniqueIndustries = Array.from(
            new Set(data.companies.map((c: Company) => c.industry).filter(Boolean))
          ).sort()
          setIndustries(uniqueIndustries as string[])
        }
      } catch (error) {
        console.error('Error fetching companies:', error)
      }
    }
    fetchCompanies()
  }, [])

  // Extract events from the response
  const events = eventsData?.events || []
  const isLoading = eventsLoading || featuredLoading

  // Unique values for filters

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDate = isDateMatch(event)
    const matchesDropdownCategory = selectedCategory === "All" || event.category === selectedCategory
    const matchesCompany = selectedCompany === "All" || event.company_id === selectedCompany
    const matchesIndustry = selectedIndustry === "All" || event.company?.industry === selectedIndustry
    const matchesCompanySize = selectedCompanySize === "All" || event.company?.company_size === selectedCompanySize

    return matchesSearch && matchesDate && matchesDropdownCategory && matchesCompany && matchesIndustry && matchesCompanySize
  })

  const filteredFeaturedEvents = filteredEvents.filter((event) => event.featured)
  const regularEvents = filteredEvents.filter((event) => !event.featured)

  // Add keen-slider hook for featured events with autoplay and navigation
  const realSliderRef = useRef<HTMLDivElement>(null)
  const sliderTimer = useRef<NodeJS.Timeout | null>(null)
  const [, slider] = useKeenSlider<HTMLDivElement>({
    slides: { perView: 1.2, spacing: 24 },
    breakpoints: {
      "(min-width: 640px)": { slides: { perView: 1.5, spacing: 24 } },
      "(min-width: 1024px)": { slides: { perView: 2.2, spacing: 32 } },
    },
    loop: filteredFeaturedEvents.length > 1,
  })

  // Autoplay effect
  useEffect(() => {
    if (!slider) return
    if (filteredFeaturedEvents.length > 1) {
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
  }, [slider, filteredFeaturedEvents.length])

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
      case "Workshop":
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
      case "Conference":
        return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
      case "Meetup":
        return "bg-gradient-to-r from-purple-500 to-violet-600 text-white"
      case "Webinar":
        return "bg-gradient-to-r from-red-500 to-pink-600 text-white"
      case "Training":
        return "bg-gradient-to-r from-orange-500 to-amber-600 text-white"
      case "Seminar":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "Networking":
        return "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
      case "Tech Talk":
        return "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
      case "Career Fair":
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
                                        <span>Events & Conferences </span>
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
                            Learn, Network,{" "}
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
                            Discover amazing events, workshops, and conferences. Connect with industry experts, learn new skills, and expand your professional network!
                        </motion.p>
                    </div>
                </motion.div>
            </section>

      {/* Search and Filters */}
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
          </div>

          {/* Filters Row */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4 flex-wrap">
            {/* Category Dropdown */}
            <div className="w-full sm:w-64">
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

            {/* Company Filter */}
            <div className="w-full sm:w-64">
              <label htmlFor="company-select" className="block text-sm font-medium text-muted-foreground mb-1">
                <Building2 className="h-3 w-3 inline mr-1" />
                Company
              </label>
              <select
                id="company-select"
                value={selectedCompany}
                onChange={e => setSelectedCompany(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background/80 shadow focus:border-primary focus:ring-2 focus:ring-primary/20 text-base"
              >
                <option value="All">All Companies</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Industry Filter */}
            <div className="w-full sm:w-64">
              <label htmlFor="industry-select" className="block text-sm font-medium text-muted-foreground mb-1">Industry</label>
              <select
                id="industry-select"
                value={selectedIndustry}
                onChange={e => setSelectedIndustry(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background/80 shadow focus:border-primary focus:ring-2 focus:ring-primary/20 text-base"
              >
                <option value="All">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Company Size Filter */}
            <div className="w-full sm:w-64">
              <label htmlFor="size-select" className="block text-sm font-medium text-muted-foreground mb-1">Company Size</label>
              <select
                id="size-select"
                value={selectedCompanySize}
                onChange={e => setSelectedCompanySize(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background/80 shadow focus:border-primary focus:ring-2 focus:ring-primary/20 text-base"
              >
                <option value="All">All Sizes</option>
                {companySizes.map(size => (
                  <option key={size} value={size}>
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* All Events */}
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
                    {/* Title and Company */}
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="font-semibold text-base hover:text-primary transition-colors cursor-pointer flex-1 line-clamp-2">
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
                        {/* Company Badge */}
                        {event.company ? (
                          <div className="mb-2">
                            <CompanyBadge 
                              company={event.company} 
                              size="sm" 
                              showVerification={true}
                            />
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground truncate mb-2">by {event.organizer}</div>
                        )}
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
                    
                    {/* Payment Information */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="text-xs font-medium">
                          {event.payment === 'Required' || event.payment === 'Paid' ? event.price : 'Free'}
                        </span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          event.payment === 'Required' || event.payment === 'Paid' 
                            ? 'border-green-200 text-green-700 bg-green-50' 
                            : 'border-blue-200 text-blue-700 bg-blue-50'
                        }`}
                      >
                        {event.payment === 'Required' || event.payment === 'Paid' ? 'Paid' : 'Free'}
                      </Badge>
                    </div>
                    {/* Registration Deadline */}
                    {event.registration_deadline && (
                      <div className="flex items-center gap-1 text-xs text-orange-600 mb-2">
                        <Clock className="h-3 w-3" />
                        Reg. Deadline: {new Date(event.registration_deadline).toLocaleDateString()}
                      </div>
                    )}
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {event.tags.slice(0, 2).map((tag: string) => (
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
                          Join Now <ArrowRight className="ml-1 h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {eventsError && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10 animate-pulse"></div>
                <Calendar className="h-16 w-16 text-red-500 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-red-600">Error loading events</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {eventsError}
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </motion.div>
          )}

          {!eventsError && regularEvents.length === 0 && (
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
                  setSelectedCategory("All")
                  setSelectedCompany("All")
                  setSelectedIndustry("All")
                  setSelectedCompanySize("All")
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
