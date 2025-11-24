"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Building2, Sparkles, Filter } from "lucide-react"
import { motion } from "framer-motion"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { CompanyCard } from "@/components/companies/CompanyCard"
import { CompanyStatsBanner } from "@/components/companies/CompanyStatsBanner"
import { CompanyRegistrationCTA } from "@/components/companies/CompanyRegistrationCTA"
import { Company } from "@/types/company"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const industries = [
  "All",
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "Manufacturing",
  "Consulting",
  "Media",
  "Other"
]

const companySizes = [
  "All",
  "startup",
  "small",
  "medium",
  "large",
  "enterprise"
]

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("All")
  const [selectedSize, setSelectedSize] = useState("All")
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const limit = 12

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })

      if (searchTerm) params.append('search', searchTerm)
      if (selectedIndustry !== 'All') params.append('industry', selectedIndustry)
      if (selectedSize !== 'All') params.append('company_size', selectedSize)

      const response = await fetch(`/api/companies?${params.toString()}`)
      const data = await response.json()

      if (data.success !== false) {
        setCompanies(data.companies || [])
        setTotal(data.total || 0)
        setHasMore(data.hasMore || false)
        setError(null)
      } else {
        setError(data.error || 'Failed to load companies')
      }
    } catch (err) {
      console.error('Error fetching companies:', err)
      setError('Failed to load companies')
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedIndustry, selectedSize, offset, limit])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const handleLoadMore = () => {
    setOffset(prev => prev + limit)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedIndustry("All")
    setSelectedSize("All")
    setOffset(0)
  }

  const filteredCompanies = companies

  return (
    <div className="flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/10">
      <Header />

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
                    <span>Event Organizers</span>
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
              Discover{" "}
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
                Companies
              </motion.span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              Discover verified companies hosting events, hackathons, and workshops. Connect with industry leaders, participate in tech challenges, and grow your career.
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* Stats Banner */}
      <CompanyStatsBanner totalCompanies={total} />

      {/* Search and Filters */}
      <section className="py-8 bg-gradient-to-b from-muted/30 to-background relative border-b border-primary/10">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search companies by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setOffset(0)
                }}
                className="pl-10 pr-4 h-12 shadow-lg border-2 focus:border-primary/50 transition-all duration-300 bg-background/80 backdrop-blur-sm rounded-xl"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="industry-select" className="block text-sm font-medium text-muted-foreground mb-1">
                  Industry
                </label>
                <Select
                  value={selectedIndustry}
                  onValueChange={(value) => {
                    setSelectedIndustry(value)
                    setOffset(0)
                  }}
                >
                  <SelectTrigger id="industry-select" className="h-10">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry === 'All' ? 'All' : industry.charAt(0).toUpperCase() + industry.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label htmlFor="size-select" className="block text-sm font-medium text-muted-foreground mb-1">
                  Company Size
                </label>
                <Select
                  value={selectedSize}
                  onValueChange={(value) => {
                    setSelectedSize(value)
                    setOffset(0)
                  }}
                >
                  <SelectTrigger id="size-select" className="h-10">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size === 'All' ? 'All' : size.charAt(0).toUpperCase() + size.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="h-10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Grid */}
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
                <Building2 className="h-4 w-4" />
                <span>All Companies</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Browse{" "}
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Verified Companies
                </span>
              </h2>
            </div>
            <div className="text-sm text-muted-foreground font-medium bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
              {total} {total === 1 ? 'company' : 'companies'} found
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
              <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/10 animate-pulse"></div>
                <Building2 className="h-16 w-16 text-red-500 relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-red-600">Error loading companies</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">{error}</p>
              <Button onClick={() => fetchCompanies()} className="bg-red-600 hover:bg-red-700 text-white">
                Try Again
              </Button>
            </motion.div>
          ) : filteredCompanies.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 animate-pulse"></div>
                <Building2 className="h-16 w-16 text-muted-foreground relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No companies found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Try adjusting your search terms or filters.
              </p>
              <Button
                onClick={handleClearFilters}
                className="glow-effect hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-purple-600"
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map((company, index) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <CompanyCard company={company} />
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loading}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  >
                    {loading ? 'Loading...' : 'Load More Companies'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Company Registration CTA */}
      <CompanyRegistrationCTA />

      <Footer />
    </div>
  )
}
