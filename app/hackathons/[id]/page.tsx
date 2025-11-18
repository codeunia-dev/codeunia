"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Calendar, Users, DollarSign, Star, Sparkles, Building2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import React from "react";
import { useHackathon } from "@/hooks/useHackathons"
import { CompanyBadge } from "@/components/companies/CompanyBadge"
import { useAnalyticsTracking } from "@/hooks/useAnalyticsTracking"
import { toast } from "sonner"

// import Header from "@/components/header";
import Footer from "@/components/footer";

// Add a rotating sponsors grid component above the Rules section in renderAbout:

interface Sponsor {
  name: string;
  logo: string;
  type: string;
}

const RotatingSponsorsGrid = ({ sponsors }: { sponsors?: Sponsor[] }) => {
  if (!sponsors || sponsors.length === 0) {
    return null;
  }
  
  const shouldAnimate = sponsors.length > 4;

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse"></span>
        Our Sponsors
      </h3>
      
      {/* Mobile Animation - Horizontal Scroll */}
      <div className="md:hidden relative w-full overflow-hidden">
        <div className={`flex gap-4 py-2 ${shouldAnimate ? 'animate-scroll' : ''}`}
             style={{ minWidth: shouldAnimate ? '200%' : undefined }}>
          {(shouldAnimate ? [...sponsors, ...sponsors] : sponsors).map((sponsor, idx) => (
            <motion.div
              key={sponsor.name + idx}
              className="flex-shrink-0 w-[180px] h-[120px] rounded-lg border border-primary/10 bg-background/50 backdrop-blur-sm p-1 flex flex-col items-center justify-center gap-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group"
              whileHover={{ y: -4 }}
            >
              <div className="relative w-20 h-20 flex items-center justify-center rounded-full p-2">
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  width={80}
                  height={80}
                  className="object-contain p-2"
                />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-xs text-white leading-tight">{sponsor.name}</h3>
                <p className="text-[10px] text-muted-foreground leading-tight">{sponsor.type}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Desktop Animation - Grid with Staggered Entrance */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sponsors.map((sponsor, idx) => (
            <motion.div
              key={sponsor.name + idx}
              className="w-full h-[200px] rounded-xl border border-primary/10 bg-background/50 backdrop-blur-sm p-4 flex flex-col items-center justify-center gap-4 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: idx * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <div className="relative w-24 h-24 flex items-center justify-center rounded-full p-2">
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  fill
                  className="object-contain p-2"
                />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg text-white leading-tight">{sponsor.name}</h3>
                <p className="text-sm text-muted-foreground leading-tight">{sponsor.type}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function HackathonDetailPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [checkingRegistration, setCheckingRegistration] = useState(true)
  const params = useParams()
  
  const slug = params?.id as string

  // Use custom hook for fetching hackathon
  const { hackathon, loading: isLoading, error: fetchError } = useHackathon(slug)

  // Track analytics
  useAnalyticsTracking({
    hackathonId: slug,
    trackView: true,
  })

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [])

  // Check registration status
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!isAuthenticated || !hackathon?.id) {
        setCheckingRegistration(false)
        setIsRegistered(false)
        return
      }

      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setCheckingRegistration(false)
          setIsRegistered(false)
          return
        }

        // Check for this specific hackathon registration
        const { data, error } = await supabase
          .from('master_registrations')
          .select('id')
          .eq('user_id', user.id)
          .eq('activity_type', 'hackathon')
          .eq('activity_id', hackathon.id.toString())
          .maybeSingle()

        // If there's an error (other than not found), log it
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking registration:', error)
        }

        // Set registration status based on whether data exists
        setIsRegistered(!!data)
      } catch (error) {
        console.error('Error checking registration:', error)
        // On error, assume not registered
        setIsRegistered(false)
      } finally {
        setCheckingRegistration(false)
      }
    }

    checkRegistrationStatus()
  }, [isAuthenticated, hackathon?.id])

  const handleRegister = async () => {
    if (!hackathon) return

    setRegistering(true)
    try {
      const response = await fetch(`/api/hackathons/${slug}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to register')
      }

      // Update state immediately
      setIsRegistered(true)
      setCheckingRegistration(false)
      toast.success('Successfully registered for the hackathon!')
      
      // Force a hard reload to clear any cached state
      window.location.href = window.location.href
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to register')
      setRegistering(false)
    }
  }

  const handleUnregister = async () => {
    if (!hackathon) return

    setRegistering(true)
    try {
      const response = await fetch(`/api/hackathons/${slug}/register`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to unregister')
      }

      // Update state immediately
      setIsRegistered(false)
      setCheckingRegistration(false)
      toast.success('Successfully unregistered from the hackathon')
      
      // Force a hard reload to clear any cached state
      window.location.href = window.location.href
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to unregister')
      setRegistering(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Web Development":
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
      case "Mobile Apps":
        return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
      case "AI/ML":
        return "bg-gradient-to-r from-purple-500 to-violet-600 text-white"
      case "Blockchain":
        return "bg-gradient-to-r from-red-500 to-pink-600 text-white"
      case "IoT":
        return "bg-gradient-to-r from-orange-500 to-amber-600 text-white"
      case "Game Development":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "Cybersecurity":
        return "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
      case "Open Source":
        return "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
      case "Social Impact":
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

  // --- Tab Content Renderers ---
  const renderAbout = () => {
    // Don't render if hackathon data is not loaded yet
    if (!hackathon) {
      return (
        <div className="space-y-6">
          <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded mb-6"></div>
            </div>
          </div>
        </div>
      )
    }
    
    return (
    <div className="space-y-6">
      <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          About the Hackathon
        </h2>
        <p className="text-lg leading-relaxed mb-6">{hackathon?.description}</p>
        <div className="flex flex-wrap gap-2 pt-6 border-t border-primary/10">
            {hackathon?.tags?.map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-sm bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-colors">
              #{tag}
            </Badge>
          ))}
        </div>
      </div>
      {/* Sponsors Grid */}
      <RotatingSponsorsGrid sponsors={hackathon?.sponsors} />
    </div>
  )
  }

  const renderRules = () => {
    if (!hackathon) {
      return (
        <div className="space-y-6">
          <div className="bg-background/50 backdrop-blur-sm p-6 rounded-2xl border border-primary/10 shadow mb-16">
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded mb-1"></div>
              <div className="h-4 bg-muted rounded mb-1"></div>
              <div className="h-4 bg-muted rounded mb-1"></div>
            </div>
          </div>
        </div>
      )
    }
    
    let rulesArray: string[] = [];
    if (Array.isArray(hackathon?.rules)) {
      rulesArray = hackathon.rules;
    } else if (hackathon?.rules && typeof hackathon.rules === 'object') {
      rulesArray = Object.values(hackathon.rules).map(String);
    }

    // Don't show rules if no data is provided
    if (rulesArray.length === 0) {
      return (
        <div className="space-y-6">
          <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl text-center">
            <svg className="h-12 w-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Rules Coming Soon</h2>
            <p className="text-muted-foreground">
              The rules and guidelines for this hackathon will be announced soon. Stay tuned!
            </p>
          </div>
        </div>
      );
    }
    
    return (
    <div className="space-y-6">
      <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Hackathon Rules & Guidelines
        </h2>
        <div className="mb-6">
          <p className="text-muted-foreground mb-4">
            To ensure a fair and enjoyable experience for all participants, please follow these rules and guidelines:
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3 text-primary">General Rules</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {rulesArray.slice(0, Math.ceil(rulesArray.length / 2)).map((rule, index) => (
                <li key={index} className="text-muted-foreground">{rule}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-primary">Additional Guidelines</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {rulesArray.slice(Math.ceil(rulesArray.length / 2)).map((rule, index) => (
                <li key={index} className="text-muted-foreground">{rule}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <h3 className="font-semibold mb-2 text-yellow-600">⚠️ Important Reminders:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Violation of rules may result in disqualification</li>
            <li>• Questions about rules should be asked before the event starts</li>
            <li>• Organizers reserve the right to modify rules if necessary</li>
          </ul>
        </div>
      </div>
    </div>
  )
  }

  const renderSchedule = () => {
    if (!hackathon) {
      return (
        <div className="space-y-6">
          <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded mb-3"></div>
              <div className="h-4 bg-muted rounded mb-3"></div>
              <div className="h-4 bg-muted rounded mb-3"></div>
            </div>
          </div>
        </div>
      )
    }
    
    let scheduleArray: { date: string, label: string }[] = [];
    if (Array.isArray(hackathon?.schedule)) {
      scheduleArray = hackathon.schedule;
    } else if (hackathon?.schedule && typeof hackathon.schedule === 'object') {
      scheduleArray = Object.entries(hackathon.schedule).map(([date, label]) => ({ date, label: String(label) }));
    }

    // Don't show schedule if no data is provided
    if (scheduleArray.length === 0) {
      return (
        <div className="space-y-6">
          <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Schedule Coming Soon</h2>
            <p className="text-muted-foreground">
              The detailed schedule for this hackathon will be announced soon. Stay tuned!
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Hackathon Schedule
          </h2>
          <div className="mb-6">
            <p className="text-muted-foreground mb-4">
              Join us for an exciting journey of innovation and collaboration. Here&apos;s what you can expect during the hackathon:
            </p>
          </div>
          <ul className="divide-y divide-primary/10">
            {scheduleArray.map((item, index) => (
              <li key={index} className="py-4 flex flex-col md:flex-row md:items-center md:gap-6">
                <span className="font-semibold min-w-[140px] text-primary bg-primary/10 px-3 py-1 rounded-full text-sm">
                  {item.date}
                </span>
                <span className="text-foreground mt-2 md:mt-0">{item.label}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <h3 className="font-semibold mb-2 text-primary">Important Notes:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All times are in local timezone</li>
              <li>• Schedule may be subject to change</li>
              <li>• Check announcements for updates</li>
              <li>• Networking breaks will be provided</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderPrizes = () => {
    if (!hackathon) {
      return (
        <div className="space-y-6">
          <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="h-12 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      )
    }
    
    const prizeAmount = hackathon?.prize || hackathon?.price || "";
    const prizeDetails = hackathon?.prize_details || "";
    
    // If no prize information is provided at all
    if (!prizeAmount && !prizeDetails) {
      return (
        <div className="space-y-6">
          <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Prize Details Coming Soon</h2>
            <p className="text-muted-foreground">
              Prize information will be announced soon. Stay tuned for exciting rewards!
            </p>
          </div>
        </div>
      );
    }
    
    return (
    <div className="space-y-6">
      <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          Prizes & Rewards
        </h2>
        
        {/* Main Prize */}
        <div className="text-center mb-8 p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20">
          {prizeAmount && (
            <div className="text-4xl font-bold text-primary mb-2">{prizeAmount}</div>
          )}
          {prizeDetails ? (
            <div className="text-muted-foreground text-left mt-4 whitespace-pre-line">
              {prizeDetails}
            </div>
          ) : prizeAmount && (
            <p className="text-muted-foreground mt-2">Detailed prize breakdown coming soon!</p>
          )}
        </div>
      </div>
    </div>
  )
  }

  const renderFAQ = () => {
    // Don't render if hackathon data is not loaded yet
    if (!hackathon) {
      return (
        <div className="space-y-6">
          <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
            </div>
          </div>
        </div>
      )
    }
    
    let faqArray: { question: string, answer: string }[] = [];
    if (Array.isArray(hackathon?.faq)) {
      faqArray = hackathon.faq;
    } else if (hackathon?.faq && typeof hackathon.faq === 'object') {
      faqArray = Object.entries(hackathon.faq).map(([question, answer]) => ({ question, answer: String(answer) }));
    }

    // Don't show FAQ if no data is provided
    if (faqArray.length === 0) {
      return (
        <div className="space-y-6">
          <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">FAQ Coming Soon</h2>
            <p className="text-muted-foreground">
              Frequently asked questions will be added soon. For now, feel free to contact the organizers with any questions!
            </p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Frequently Asked Questions
          </h2>
          <div className="mb-6">
            <p className="text-muted-foreground mb-4">
              Find answers to common questions about the hackathon. If you don&apos;t see your question here, feel free to contact us!
            </p>
          </div>
          <div className="space-y-6">
            {faqArray.map((faq, index) => (
              <div key={index} className="border border-primary/10 rounded-lg p-4 hover:bg-background/30 transition-colors">
                <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <span className="text-sm bg-primary/10 px-2 py-1 rounded-full">Q{index + 1}</span>
                  {faq.question}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <h3 className="font-semibold mb-2 text-primary">Still have questions?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Don&apos;t hesitate to reach out to our organizing team. We&apos;re here to help!
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                📧 Email Support
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                💬 Live Chat
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                📱 WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };



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

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto" />
            <div className="absolute inset-0 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse mx-auto"></div>
          </div>
          <h1 className="text-2xl font-bold">{fetchError}</h1>
          <Button asChild className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
            <Link href="/hackathons">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hackathons
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background"> {/* Ensures footer stays at the bottom */}
      {/* <Header/> */}
      {/* Back to Hackathons - full width, above banner */}
      <div className="w-full bg-background/90 sticky top-0 z-50 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" asChild className="hover:bg-primary/10 transition-colors">
            <Link href="/hackathons">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hackathons
            </Link>
          </Button>
        </div>
      </div>
      {/* Hackathon Banner - full width, edge-to-edge */}
      <div className="w-full relative">
        <div className="aspect-[2/1] sm:aspect-[4/1] bg-muted overflow-hidden rounded-b-2xl relative">
          {hackathon?.image ? (
            <Image
              src={hackathon.image}
              alt={hackathon.title || 'Hackathon image'}
              fill
              className="object-cover w-full h-full"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
      {/* Main Content - centered, white background, margin-top */}
      <div className="flex-1 flex flex-col"> {/* Ensures main content grows to fill space */}
        <div className="w-full flex justify-center pt-8 md:pt-12 pb-24"> {/* Inner wrapper for centering and padding */}
          <div className="max-w-6xl w-full bg-white dark:bg-background rounded-2xl shadow-lg mt-0 relative z-10 px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content with Tabs */}
              <div className="lg:col-span-2 space-y-8">
                {/* Hackathon Header */}
                <div className="space-y-4">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">{hackathon?.title}</h1>
                  
                  {/* Hosted by Section */}
                  {hackathon?.company ? (
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-primary/10">
                      <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground">Hosted by</span>
                        <Link href={`/companies/${hackathon.company.slug}`} className="hover:opacity-80 transition-opacity">
                          <CompanyBadge 
                            company={hackathon.company} 
                            size="md" 
                            showVerification={true}
                          />
                        </Link>
                      </div>
                    </div>
                  ) : hackathon?.organizer && (
                    <div className="text-base md:text-lg text-muted-foreground font-bold mt-1">by {hackathon.organizer}</div>
                  )}
                  
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">{hackathon?.excerpt}</p>
                  <div className="flex items-center gap-3 flex-wrap mt-2">
                    <Badge className={`${getCategoryColor(hackathon?.category || '')} shadow-lg`} variant="secondary">{hackathon?.category}</Badge>
                    {hackathon?.featured && (<Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg"><Star className="h-3 w-3 mr-1" />Featured</Badge>)}
                    <Badge className={`${getStatusColor(hackathon?.status || '')} shadow-lg`} variant="secondary">{hackathon?.status}</Badge>
                  </div>
                </div>
                {/* Registration Card (mobile only) */}
                {(hackathon?.status === 'live' || hackathon?.status === 'published') && (
                  <div className="block lg:hidden mb-4">
                    <div className="bg-white dark:bg-background border border-primary/10 rounded-xl shadow-md p-6">
                      <div className="text-lg font-semibold mb-2">Registration</div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Users className="h-4 w-4" />
                        <span>{hackathon?.registered ?? 0} participants registered</span>
                      </div>
                      {hackathon?.registration_deadline && (
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                          <Calendar className="h-4 w-4" />
                          <span>Registration deadline</span>
                          <span className="font-medium text-foreground">{new Date(hackathon.registration_deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                      {isAuthenticated ? (
                        isRegistered ? (
                          <Button 
                            variant="outline"
                            onClick={handleUnregister}
                            disabled={registering}
                            className="w-full hover:bg-red-50 hover:border-red-200 hover:text-red-600 mt-2"
                          >
                            {registering ? 'Processing...' : 'Unregister'}
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleRegister}
                            disabled={registering || checkingRegistration}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg mt-2"
                          >
                            {registering ? 'Registering...' : checkingRegistration ? 'Loading...' : 'Register Now'}
                          </Button>
                        )
                      ) : (
                        <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg mt-2" asChild>
                          <Link href={`/auth/signin?returnUrl=${encodeURIComponent(`/hackathons/${slug}`)}`}>
                            Sign in to register
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                {/* Tabs */}
                <div className="w-full">
                  {hackathon ? (
                    <Tabs defaultValue="about" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="about">About</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                        <TabsTrigger value="rules">Rules</TabsTrigger>
                        <TabsTrigger value="prizes">Prizes</TabsTrigger>
                        <TabsTrigger value="faq">FAQ</TabsTrigger>
                      </TabsList>
                      <TabsContent value="about" className="mt-6">
                        {renderAbout()}
                      </TabsContent>
                      <TabsContent value="schedule" className="mt-6">
                        {renderSchedule()}
                      </TabsContent>
                      <TabsContent value="rules" className="mt-6">
                        {renderRules()}
                      </TabsContent>
                      <TabsContent value="prizes" className="mt-6">
                        {renderPrizes()}
                      </TabsContent>
                      <TabsContent value="faq" className="mt-6">
                        {renderFAQ()}
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="animate-pulse">
                      <div className="h-10 bg-muted rounded-md mb-6"></div>
                      <div className="space-y-4">
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Sidebar (Hackathon Details, Registration, Need Help) */}
              <div className="space-y-6">
                {/* Registration Card (desktop only) */}
                {(hackathon?.status === 'live' || hackathon?.status === 'published') && (
                  <div className="hidden lg:block">
                    <div className="bg-white dark:bg-background border border-primary/10 rounded-xl shadow-md p-6">
                      <div className="text-lg font-semibold mb-2">Registration</div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Users className="h-4 w-4" />
                        <span>{hackathon?.registered ?? 0} participants registered</span>
                      </div>
                      {hackathon?.registration_deadline && (
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                          <Calendar className="h-4 w-4" />
                          <span>Registration deadline</span>
                          <span className="font-medium text-foreground">{new Date(hackathon.registration_deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                      {isAuthenticated ? (
                        isRegistered ? (
                          <Button 
                            variant="outline"
                            onClick={handleUnregister}
                            disabled={registering}
                            className="w-full hover:bg-red-50 hover:border-red-200 hover:text-red-600 mt-2"
                          >
                            {registering ? 'Processing...' : 'Unregister'}
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleRegister}
                            disabled={registering || checkingRegistration}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg mt-2"
                          >
                            {registering ? 'Registering...' : checkingRegistration ? 'Loading...' : 'Register Now'}
                          </Button>
                        )
                      ) : (
                        <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg mt-2" asChild>
                          <Link href={`/auth/signin?returnUrl=${encodeURIComponent(`/hackathons/${slug}`)}`}>
                            Sign in to register
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                {/* Hackathon Details Card */}
                <div className="bg-white dark:bg-background border border-primary/10 rounded-xl shadow-md p-6">
                  <div className="text-lg font-semibold mb-4">Hackathon Details</div>
                  <div className="mb-2">
                    <span className="block text-xs text-muted-foreground">Event Type</span>
                    <span className="font-medium">{hackathon?.event_type?.join(', ') || '-'}</span>
                  </div>
                  <div className="mb-2">
                    <span className="block text-xs text-muted-foreground">Team Size</span>
                    <span className="font-medium">
                      {hackathon?.team_size ? (
                        Array.isArray(hackathon.team_size) && hackathon.team_size.length === 2
                          ? `${hackathon.team_size[0]}-${hackathon.team_size[1]} members`
                          : typeof hackathon.team_size === 'object' && hackathon.team_size.min && hackathon.team_size.max 
                            ? `${hackathon.team_size.min}-${hackathon.team_size.max} members`
                            : typeof hackathon.team_size === 'number' 
                              ? `${hackathon.team_size} member${hackathon.team_size > 1 ? 's' : ''}`
                              : hackathon.team_size
                      ) : '-'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="block text-xs text-muted-foreground">Date</span>
                    <span className="font-medium">{hackathon?.date ? new Date(hackathon.date).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="mb-2">
                    <span className="block text-xs text-muted-foreground">Location</span>
                    <span className="font-medium">{hackathon?.location || '-'}</span>
                  </div>
                  <div className="mb-2">
                    <span className="block text-xs text-muted-foreground">Prize Pool</span>
                    <span className="font-medium">{hackathon?.prize || hackathon?.price || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground">Skill Level</span>
                    <span className="font-medium">Open to All Skill Levels</span>
                  </div>
                </div>
                {/* Need Help Card (optional) */}
                <div className="bg-white dark:bg-background border border-primary/10 rounded-xl shadow-md p-6">
                  <div className="text-lg font-semibold mb-2">Need Help?</div>
                  <div className="text-sm text-muted-foreground mb-2">Have questions about this hackathon? Contact the organizers or check the FAQ section.</div>
                  
                  {/* Social Icons Row */}
                  {hackathon?.socials && Object.keys(hackathon.socials).length > 0 && (
                    <div className="flex flex-wrap justify-center gap-3 mb-4">
                      {hackathon.socials.linkedin && (
                        <a href={hackathon.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors shadow">
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="4" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M8 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="8" cy="8" r="1" fill="currentColor"/><path d="M12 16v-3a2 2 0 0 1 4 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        </a>
                      )}
                      {hackathon.socials.twitter && (
                        <a href={hackathon.socials.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter/X" className="rounded-full bg-slate-100 dark:bg-slate-900/30 p-3 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow">
                          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                      )}
                      {hackathon.socials.discord && (
                        <a href={hackathon.socials.discord} target="_blank" rel="noopener noreferrer" aria-label="Discord" className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 p-3 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors shadow">
                          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                        </a>
                      )}
                      {hackathon.socials.website && (
                        <a href={hackathon.socials.website} target="_blank" rel="noopener noreferrer" aria-label="Website" className="rounded-full bg-gray-100 dark:bg-gray-900/30 p-3 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors shadow">
                          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        </a>
                      )}
                      {hackathon.socials.whatsapp && (
                        <a href={hackathon.socials.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 hover:bg-green-200 dark:hover:bg-green-800 transition-colors shadow">
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 1.85.504 3.59 1.38 5.08L2 22l5.09-1.36A9.953 9.953 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Zm0 18a7.95 7.95 0 0 1-4.09-1.13l-.29-.17-3.02.8.81-2.95-.19-.3A7.96 7.96 0 1 1 20 12c0 4.411-3.589 8-8 8Zm4.29-5.38c-.22-.11-1.3-.64-1.5-.71-.2-.07-.35-.11-.5.11-.15.22-.57.71-.7.86-.13.15-.26.16-.48.05-.22-.11-.93-.34-1.77-1.09-.66-.59-1.1-1.31-1.23-1.53-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.07-.11-.5-1.21-.68-1.66-.18-.44-.36-.38-.5-.39-.13-.01-.28-.01-.43-.01-.15 0-.39.06-.6.28-.21.22-.8.78-.8 1.9 0 1.12.82 2.2.93 2.35.11.15 1.62 2.48 3.93 3.38.55.19.98.3 1.31.38.55.14 1.05.12 1.44.07.44-.07 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.05-.09-.2-.14-.42-.25Z"/></svg>
                        </a>
                      )}
                      {hackathon.socials.instagram && (
                        <a href={hackathon.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full bg-pink-100 dark:bg-pink-900/30 p-3 hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors shadow">
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg>
                        </a>
                      )}
                    </div>
                  )}
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl py-3 px-4 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border-0 group relative overflow-hidden"
                    onClick={() => {
                      const phoneNumber = hackathon?.organizer_contact?.phone || '+91 86990 25107';
                      const cleanPhoneNumber = phoneNumber.replace(/\s+/g, '');
                      window.open(`tel:${cleanPhoneNumber}`, '_self');
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <div className="relative flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>Contact Organizer</span>
                    </div>
                    <div className="text-xs opacity-90 mt-1">{hackathon?.organizer_contact?.phone || '+91 86990 25107'}</div>
                  </Button>
                </div>
              </div>
            </div> {/* end grid */}
            {/* Disclaimer Section - left aligned, bordered box */}
            <div className="mt-6 mb-2 max-w-3xl">
              <div className="bg-background/50 border border-primary/10 rounded-xl p-4">
                <p className="text-xs text-muted-foreground text-left">
                  This opportunity has been listed by Codeunia. Codeunia is not liable for any content mentioned in this opportunity or the process followed by the organizers for this opportunity. However, please
                  <Link href="/contact" className="text-green-600 underline ml-1 hover:text-green-700 transition-colors inline-block">
                    Raise a Complaint
                  </Link>{' '}
                  if you want Codeunia to look into the matter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer/>
    </div>
  )
}

