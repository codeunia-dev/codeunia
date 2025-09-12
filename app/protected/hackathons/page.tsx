"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Clock, Calendar, CheckCircle, XCircle, AlertCircle, Trophy, Award, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useMasterRegistrations, MasterRegistration } from "@/hooks/useMasterRegistrations"

export default function ProtectedHackathonsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Get user's hackathon registrations
  const { 
    registrations, 
    loading: registrationsLoading, 
    error: registrationsError 
  } = useMasterRegistrations({ activity_type: 'hackathon' })

  // Filter registrations based on search and status
  const filteredRegistrations = registrations.filter((reg: MasterRegistration) => {
    const matchesSearch = !searchTerm || 
      reg.metadata?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.metadata?.organizer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.metadata?.category?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || reg.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registered":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "attended":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "no_show":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "disqualified":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "registered":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "completed":
        return <Trophy className="h-4 w-4" />
      case "attended":
        return <Award className="h-4 w-4" />
      case "no_show":
        return <AlertCircle className="h-4 w-4" />
      case "disqualified":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }


  if (registrationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
        </div>
      </div>
    )
  }

  if (registrationsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Your Hackathons</h2>
          <p className="text-muted-foreground">{registrationsError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full mb-4">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-2">
            My Hackathon Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Track your hackathon participation and achievements
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <div className="text-3xl font-bold text-blue-600 mb-2">{registrations.length}</div>
            <div className="text-sm text-muted-foreground">Total Participations</div>
          </Card>
          <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {registrations.filter(r => r.status === 'completed' || r.status === 'attended').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </Card>
          <Card className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {registrations.filter(r => r.status === 'registered' || r.status === 'pending').length}
            </div>
            <div className="text-sm text-muted-foreground">Active</div>
          </Card>
          <Card className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {registrations.filter(r => r.payment_status === 'paid').length}
            </div>
            <div className="text-sm text-muted-foreground">Paid</div>
          </Card>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8"
        >
          {/* Search Bar */}
          <div className="relative w-full lg:w-96 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search your hackathons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 h-12 shadow-lg border-2 focus:border-primary/50 transition-all duration-300 bg-background/80 backdrop-blur-sm rounded-xl"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-primary/20 bg-background/80 shadow focus:border-primary focus:ring-2 focus:ring-primary/20 text-base"
            >
              <option value="all">All Status</option>
              <option value="registered">Registered</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="attended">Attended</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </motion.div>

        {/* Hackathons List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Hackathon Participations</h2>
            <div className="text-sm text-muted-foreground bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
              {filteredRegistrations.length} hackathons found
            </div>
          </div>

          {/* Hackathons List */}
          <div className="space-y-4">
            {filteredRegistrations.map((registration: MasterRegistration, index) => (
              <motion.div
                key={registration.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left Side - Hackathon Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                          {registration.metadata?.title?.charAt(0) || 'H'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">
                              {registration.metadata?.title || `Hackathon #${registration.activity_id}`}
                            </h3>
                            <Badge className={`${getStatusColor(registration.status)} flex items-center gap-1`}>
                              {getStatusIcon(registration.status)}
                              {registration.status}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {registration.metadata?.category && (
                              <Badge variant="outline" className="text-xs">
                                {registration.metadata.category}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {registration.payment_status}
                            </Badge>
                            {registration.payment_amount && (
                              <Badge variant="outline" className="text-xs">
                                {registration.payment_currency} {registration.payment_amount}
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Registered: {new Date(registration.registration_date).toLocaleDateString()}</span>
                            </div>
                            {registration.metadata?.event_date && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Event: {new Date(registration.metadata.event_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {registration.metadata?.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{registration.metadata.location}</span>
                              </div>
                            )}
                            {registration.metadata?.team_name && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>Team: {registration.metadata.team_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      {registration.metadata?.slug && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/hackathons/${registration.metadata.slug}`}>
                            View Details
                          </Link>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" disabled>
                        View Certificate
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredRegistrations.length === 0 && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 animate-pulse"></div>
                <Trophy className="h-16 w-16 text-muted-foreground relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No hackathons found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {registrations.length === 0 
                  ? "You haven't participated in any hackathons yet. Start your journey by exploring available hackathons!"
                  : "Try adjusting your search terms or filters to find your hackathons."
                }
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
                {registrations.length === 0 && (
                  <Button
                    asChild
                    className="glow-effect hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-purple-600"
                  >
                    <Link href="/hackathons">
                      Browse Hackathons
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
