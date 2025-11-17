"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Company } from "@/types/company"
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
  Trophy,
  Link as LinkIcon,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Hackathon {
  id: string
  title: string
  slug: string
  description: string
  excerpt: string
  image?: string
  start_date: string
  end_date: string
  location: string
  mode: string
  prize_pool?: string
  max_team_size: number
  min_team_size: number
  registered_teams: number
  max_teams: number
  status: string
  tags: string[]
  organizer: string
}

export default function CompanyHackathonsPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [company, setCompany] = useState<Company | null>(null)
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [copiedHackathonId, setCopiedHackathonId] = useState<string | null>(null)
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

  const fetchHackathons = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })

      if (searchTerm) params.append('search', searchTerm)

      // Note: This endpoint would need to be created similar to events
      const response = await fetch(`/api/companies/${slug}/hackathons?${params.toString()}`)
      const data = await response.json()

      if (data.success !== false) {
        setHackathons(data.hackathons || [])
        setTotal(data.total || 0)
        setHasMore(data.hasMore || false)
        setError(null)
      } else {
        setError(data.error || 'Failed to load hackathons')
      }
    } catch (err) {
      console.error('Error fetching hackathons:', err)
      setError('Failed to load hackathons')
    } finally {
      setLoading(false)
    }
  }, [slug, searchTerm, offset, limit])

  useEffect(() => {
    if (slug) {
      fetchCompany()
      fetchHackathons()
    }
  }, [slug, fetchCompany, fetchHackathons])

  const handleLoadMore = () => {
    setOffset((prev) => prev + limit)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setOffset(0)
  }

  const handleCopyLink = (hackathonSlug: string, id: string) => {
    const url = `${window.location.origin}/hackathons/${hackathonSlug}`
    navigator.clipboard.writeText(url)
    setCopiedHackathonId(id)
    setTimeout(() => setCopiedHackathonId(null), 1500)
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
        <section className="pt-24 pb-12 bg-gradient-to-b from-muted/30 to-background border-b border-primary/10">
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
                  <p className="text-muted-foreground">Hackathons hosted by {company.name}</p>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Search */}
      <section className="py-8 bg-gradient-to-b from-background to-muted/30 border-b border-primary/10">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col gap-4">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search hackathons..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setOffset(0)
                }}
                className="pl-10 pr-4 h-12 shadow-lg border-2 focus:border-primary/50 transition-all duration-300 bg-background/80 backdrop-blur-sm rounded-xl"
              />
            </div>

            {searchTerm && (
              <Button variant="outline" onClick={handleClearFilters} className="w-fit">
                Clear Search
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Hackathons Grid */}
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
                <Trophy className="h-4 w-4" />
                <span>Hackathons</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                All{" "}
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Hackathons
                </span>
              </h2>
            </div>
            <div className="text-sm text-muted-foreground font-medium bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
              {total} {total === 1 ? "hackathon" : "hackathons"} found
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
                <Trophy className="h-16 w-16 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-red-600">Error loading hackathons</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">{error}</p>
              <Button onClick={() => fetchHackathons()} className="bg-red-600 hover:bg-red-700 text-white">
                Try Again
              </Button>
            </motion.div>
          ) : hackathons.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Trophy className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No hackathons found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {company?.name} hasn&apos;t hosted any hackathons yet, or try adjusting your search.
              </p>
              <Button onClick={handleClearFilters} className="bg-gradient-to-r from-primary to-purple-600">
                Clear Search
              </Button>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hackathons.map((hackathon, index) => (
                  <motion.div
                    key={hackathon.id}
                    className="flex h-full"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="flex flex-col h-full group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
                      {/* Hackathon Image */}
                      <div className="h-32 w-full relative flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 border-b border-primary/10">
                        {hackathon.image ? (
                          <Image
                            src={hackathon.image}
                            alt={hackathon.title || "Hackathon image"}
                            fill
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            priority={index < 6}
                          />
                        ) : (
                          <Trophy className="h-12 w-12 text-muted-foreground opacity-40" />
                        )}
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className={`${getStatusColor(hackathon.status)} shadow-lg text-xs`}>
                            {hackathon.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="flex-1 flex flex-col p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg">
                            <Trophy className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-semibold text-base truncate hover:text-primary transition-colors cursor-pointer flex-1">
                                {hackathon.title}
                              </div>
                              <button
                                onClick={() => handleCopyLink(hackathon.slug, String(hackathon.id))}
                                className="p-1 bg-background/80 rounded-full border border-primary/20 hover:bg-primary/10 transition-colors flex-shrink-0"
                                title="Copy hackathon link"
                              >
                                <LinkIcon className="h-4 w-4 text-primary" />
                              </button>
                            </div>
                            {copiedHackathonId === String(hackathon.id) && (
                              <span className="text-xs text-primary">Copied!</span>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {hackathon.excerpt}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(hackathon.start_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.ceil(
                              (new Date(hackathon.end_date).getTime() -
                                new Date(hackathon.start_date).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                            days
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {hackathon.mode}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {hackathon.registered_teams}/{hackathon.max_teams} teams
                          </div>
                        </div>

                        {hackathon.prize_pool && (
                          <div className="flex items-center gap-1 mb-2">
                            <DollarSign className="h-3 w-3" />
                            <span className="text-xs font-medium">Prize: {hackathon.prize_pool}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1 mb-2">
                          {hackathon.tags.slice(0, 2).map((tag: string) => (
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
                            <Link href={`/hackathons/${hackathon.id}`}>
                              View Details <ArrowRight className="ml-1 h-5 w-5" />
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
                    {loading ? "Loading..." : "Load More Hackathons"}
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
