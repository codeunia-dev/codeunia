"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Company } from "@/types/company"
import { Event } from "@/lib/services/events"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  ArrowRight,
  Link as LinkIcon,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  "Career Fair",
]

export default function CompanyEventsPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [company, setCompany] = useState<Company | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const limit = 12

  const fetchCompany = useCallback(async () => {
    try {
      const response = await fetch(`/api/companies/${slug}`)
      const data = await response.json()

      if (data.success !== false && data.company) {
        setCompany(data.company)
      }
    } catch (err) {
      console.error('Error fetching company:', err)
    }
  }, [slug])

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })

      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory !== 'All') params.append('category', selectedCategory)

      const response = await fetch(`/api/companies/${slug}/events?${params.toString()}`)
      const data = await response.json()

      if (data.success !== false) {
        setEvents(data.events || [])
        setTotal(data.total || 0)
        setHasMore(data.hasMore || false)
        setError(null)
      } else {
        setError(data.error || 'Failed to load events')
      }
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [slug, searchTerm, selectedCategory, offset, limit])

  useEffect(() => {
    if (slug) {
      fetchCompany()
      fetchEvents()
    }
  }, [slug, fetchCompany, fetchEvents])

  const handleLoadMore = () => {
    setOffset((prev) => prev + limit)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("All")
    setOffset(0)
  }

  const handleCopyLink = (eventSlug: string, id: string) => {
    const url = `${window.location.origin}/events/${eventSlug}`
    navigator.clipboard.writeText(url)
    setCopiedEventId(id)
    setTimeout(() => setCopiedEventId(null), 1500)
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
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-600 text-white"
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <Header />

      {/* Company Header */}
      {company && (
        <section className="py-12 bg-gradient-to-b from-muted/30 to-background border-b border-primary/10">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <Link
                href={`/companies/${slug}`}
                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
              >
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {company.logo_url ? (
                    <Image
                      src={company.logo_url}
                      alt={company.name}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  ) : (
                    company.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{company.name}</h1>
                  <p className="text-muted-foreground">Events hosted by {company.name}</p>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <section className="py-8 bg-gradient-to-b from-background to-muted/30 border-b border-primary/10">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setOffset(0)
                }}
                className="pl-10 pr-4 h-12 shadow-lg border-2 focus:border-primary/50 transition-all duration-300 bg-background/80 backdrop-blur-sm rounded-xl"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="category-select" className="block text-sm font-medium text-muted-foreground mb-1">
                  Event Category
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setSelectedCategory(value)
                    setOffset(0)
                  }}
                >
                  <SelectTrigger id="category-select" className="h-10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" onClick={handleClearFilters} className="h-10">
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 flex-1">
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
                <span>Events</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                All{" "}
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Events
                </span>
              </h2>
            </div>
            <div className="text-sm text-muted-foreground font-medium bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
              {total} {total === 1 ? "event" : "events"} found
            </div>
          </motion.div>

          {loading && offset === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
              </div>
            </div>
          ) : error ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Calendar className="h-16 w-16 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-red-600">Error loading events</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">{error}</p>
              <Button onClick={() => fetchEvents()} className="bg-red-600 hover:bg-red-700 text-white">
                Try Again
              </Button>
            </motion.div>
          ) : events.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Calendar className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No events found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {company?.name} hasn&apos;t hosted any events yet, or try adjusting your filters.
              </p>
              <Button onClick={handleClearFilters} className="bg-gradient-to-r from-primary to-purple-600">
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    className="flex h-full"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="flex flex-col h-full group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
                      {/* Event Image */}
                      <div className="h-32 w-full relative flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 border-b border-primary/10">
                        {event.image ? (
                          <Image
                            src={event.image}
                            alt={event.title || "Event image"}
                            fill
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            priority={index < 6}
                          />
                        ) : (
                          <Calendar className="h-12 w-12 text-muted-foreground opacity-40" />
                        )}
                        <div className="absolute top-2 left-2 flex gap-1 z-10">
                          <Badge className={`${getCategoryColor(event.category)} shadow-lg text-xs`}>
                            {event.category}
                          </Badge>
                        </div>
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className={`${getStatusColor(event.status)} shadow-lg text-xs`}>
                            {event.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="flex-1 flex flex-col p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {event.organizer.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-semibold text-base truncate hover:text-primary transition-colors cursor-pointer flex-1">
                                {event.title}
                              </div>
                              <button
                                onClick={() => handleCopyLink(event.slug, String(event.id))}
                                className="p-1 bg-background/80 rounded-full border border-primary/20 hover:bg-primary/10 transition-colors flex-shrink-0"
                                title="Copy event link"
                              >
                                <LinkIcon className="h-4 w-4 text-primary" />
                              </button>
                            </div>
                            {copiedEventId === String(event.id) && (
                              <span className="text-xs text-primary">Copied!</span>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground mb-2 line-clamp-2">{event.excerpt}</div>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
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

                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="text-xs font-medium">
                              {event.payment === "Required" || event.payment === "Paid"
                                ? event.price
                                : "Free"}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              event.payment === "Required" || event.payment === "Paid"
                                ? "border-green-200 text-green-700 bg-green-50"
                                : "border-blue-200 text-blue-700 bg-blue-50"
                            }`}
                          >
                            {event.payment === "Required" || event.payment === "Paid" ? "Paid" : "Free"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {event.tags.slice(0, 2).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xxs bg-background/50">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="mt-auto pt-2 flex justify-end">
                          <Button
                            variant="default"
                            size="lg"
                            className="font-semibold px-6 py-2 rounded-full text-base bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg"
                            asChild
                          >
                            <Link href={`/events/${event.slug}`}>
                              View Event <ArrowRight className="ml-1 h-5 w-5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-12">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loading}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-purple-600"
                  >
                    {loading ? "Loading..." : "Load More Events"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
