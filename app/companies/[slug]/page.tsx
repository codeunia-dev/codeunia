"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { CompanyProfile } from "@/components/companies/CompanyProfile"
import { Company } from "@/types/company"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Trophy, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function CompanyProfilePage() {
  const params = useParams()
  const slug = params?.slug as string
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompany = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/companies/${slug}`)
      const data = await response.json()

      if (data.success !== false && data.company) {
        setCompany(data.company)
        setError(null)
      } else {
        setError(data.error || 'Company not found')
      }
    } catch (err) {
      console.error('Error fetching company:', err)
      setError('Failed to load company')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    if (slug) {
      fetchCompany()
    }
  }, [slug, fetchCompany])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Calendar className="h-16 w-16 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Company Not Found</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {error || 'The company you are looking for does not exist or has been removed.'}
            </p>
            <Button asChild>
              <Link href="/companies">Browse Companies</Link>
            </Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <Header />

      <main className="flex-1 py-12">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CompanyProfile company={company} />
          </motion.div>

          {/* Tabs for Events and Hackathons */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs defaultValue="events" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="events" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Events
                </TabsTrigger>
                <TabsTrigger value="hackathons" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Hackathons
                </TabsTrigger>
              </TabsList>

              <TabsContent value="events" className="mt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Upcoming Events</h3>
                  <Button variant="outline" asChild>
                    <Link href={`/companies/${slug}/events`}>
                      View All Events
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <p className="text-muted-foreground">
                  View all events hosted by {company.name} on the{" "}
                  <Link href={`/companies/${slug}/events`} className="text-primary hover:underline">
                    events page
                  </Link>
                  .
                </p>
              </TabsContent>

              <TabsContent value="hackathons" className="mt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Hackathons</h3>
                  <Button variant="outline" asChild>
                    <Link href={`/companies/${slug}/hackathons`}>
                      View All Hackathons
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <p className="text-muted-foreground">
                  View all hackathons hosted by {company.name} on the{" "}
                  <Link href={`/companies/${slug}/hackathons`} className="text-primary hover:underline">
                    hackathons page
                  </Link>
                  .
                </p>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
