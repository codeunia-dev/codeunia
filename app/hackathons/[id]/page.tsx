"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Calendar, Users, DollarSign, Star, Sparkles} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image";
import { Tabs as AnimatedTabs } from "@/components/ui/tabs";
import React from "react";
import { useHackathon } from "@/hooks/useHackathons"

// import Header from "@/components/header";
import Footer from "@/components/footer";

// Add a rotating sponsors grid component above the Rules section in renderAbout:

interface Sponsor {
  name: string;
  logo: string;
  type: string;
}

const RotatingSponsorsGrid = ({ sponsors }: { sponsors?: Sponsor[] }) => {
  if (!sponsors || sponsors.length === 0) return null;
  const shouldAnimate = sponsors.length > 4;
  // Duplicate sponsors for infinite scroll
  const displaySponsors = shouldAnimate ? [...sponsors, ...sponsors] : sponsors;

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
        <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse"></span>
        Our Sponsors
      </h3>
      <div className="relative w-full overflow-hidden">
        <div className={`flex gap-4 py-2 ${shouldAnimate ? 'animate-scroll' : ''}`}
             style={{ minWidth: shouldAnimate ? '200%' : undefined }}>
          {displaySponsors.map((sponsor, idx) => (
            <motion.div
              key={sponsor.name + idx}
              className="flex-shrink-0 w-[180px] h-[120px] rounded-lg border border-primary/10 bg-background/50 backdrop-blur-sm p-1 flex flex-col items-center justify-center gap-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group"
              whileHover={{ y: -4 }}
            >
              <div className="relative w-20 h-20 flex items-center justify-center rounded-full p-2">
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  fill
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
    </div>
  );
};

export default function HackathonDetailPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const params = useParams()
  
  const slug = params?.id as string

  // Use custom hook for fetching hackathon
  const { hackathon, loading: isLoading, error: fetchError } = useHackathon(slug)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [])

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
  const renderAbout = () => (
    <div className="space-y-6">
      <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          About the Hackathon
        </h2>
        <p className="text-lg leading-relaxed mb-6">{hackathon?.description}</p>
        <div className="flex flex-wrap gap-2 pt-6 border-t border-primary/10">
          {hackathon?.tags.map((tag: string) => (
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

  const renderRules = () => (
    <div className="space-y-6">
      {hackathon?.rules && (
        <div className="bg-background/50 backdrop-blur-sm p-6 rounded-2xl border border-primary/10 shadow mb-16">
          <h3 className="font-semibold mb-2">Rules</h3>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            {hackathon.rules.map((rule: string) => <li key={rule}>{rule}</li>)}
          </ul>
        </div>
      )}
    </div>
  )

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Hackathon Schedule
        </h2>
        <ul className="divide-y divide-primary/10">
          {hackathon?.schedule?.map((item: { date: string, label: string }) => (
            <li key={item.date} className="py-3 flex flex-col md:flex-row md:items-center md:gap-4">
              <span className="font-medium min-w-[120px] text-primary">{item.date}</span>
              <span className="text-muted-foreground">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  const renderPrizes = () => (
    <div className="space-y-6">
      <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          Prizes
        </h2>
        <div className="text-3xl font-bold text-primary mb-2">{hackathon?.prize}</div>
        <p className="text-muted-foreground">{hackathon?.prize_details || 'Exciting rewards, sponsor goodies, and recognition.'}</p>
      </div>
    </div>
  )

  const renderFAQ = () => (
    <div className="space-y-6">
      <div className="bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Frequently Asked Questions
        </h2>
        <ul className="space-y-4">
          {hackathon?.faq?.map((q: { question: string, answer: string }) => (
            <li key={q.question}>
              <div className="font-semibold">{q.question}</div>
              <div className="text-muted-foreground">{q.answer}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  const hackathonTabs = [
    {
      title: "About",
      value: "about",
      content: (
        <div>{renderAbout()}</div>
      ),
    },
    {
      title: "Schedule",
      value: "schedule",
      content: renderSchedule(),
    },
    {
      title: "Rules",
      value: "rules",
      content: renderRules(),
    },
    {
      title: "Prizes",
      value: "prizes",
      content: renderPrizes(),
    },
    {
      title: "FAQ",
      value: "faq",
      content: renderFAQ(),
    },
  ];

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
        <div className="aspect-[2/1] sm:aspect-[4/1] bg-muted overflow-hidden rounded-b-2xl">
          {hackathon?.image ? (
            <Image
              src={hackathon.image}
              alt={hackathon.title || 'Hackathon image'}
              fill
              className="object-cover w-full h-full"
              priority
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
                  {hackathon?.organizer && (
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
                {hackathon?.registration_required && hackathon?.status === 'live' && (
                  <div className="block lg:hidden mb-4">
                    <div className="bg-white dark:bg-background border border-primary/10 rounded-xl shadow-md p-6">
                      <div className="text-lg font-semibold mb-2">Registration</div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Users className="h-4 w-4" />
                        <span>{hackathon?.registered ?? 0} participants registered</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <Calendar className="h-4 w-4" />
                        <span>Registration deadline</span>
                        <span className="font-medium text-foreground">{hackathon?.registration_deadline ? new Date(hackathon.registration_deadline).toLocaleDateString() : '-'}</span>
                      </div>
                      {isAuthenticated ? (
                        <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg mt-2">Register Now</Button>
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
                  <AnimatedTabs tabs={hackathonTabs} />
                </div>
              </div>
              {/* Sidebar (Hackathon Details, Registration, Need Help) */}
              <div className="space-y-6">
                {/* Registration Card (desktop only) */}
                {hackathon?.registration_required && hackathon?.status === 'live' && (
                  <div className="hidden lg:block">
                    <div className="bg-white dark:bg-background border border-primary/10 rounded-xl shadow-md p-6">
                      <div className="text-lg font-semibold mb-2">Registration</div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Users className="h-4 w-4" />
                        <span>{hackathon?.registered ?? 0} participants registered</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <Calendar className="h-4 w-4" />
                        <span>Registration deadline</span>
                        <span className="font-medium text-foreground">{hackathon?.registration_deadline ? new Date(hackathon.registration_deadline).toLocaleDateString() : '-'}</span>
                      </div>
                      {isAuthenticated ? (
                        <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg mt-2">Register Now</Button>
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
                  {hackathon?.socials && (
                    <div className="flex justify-center gap-4 mb-4">
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
                      {hackathon.socials.linkedin && (
                        <a href={hackathon.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors shadow">
                          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="4" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M8 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="8" cy="8" r="1" fill="currentColor"/><path d="M12 16v-3a2 2 0 0 1 4 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
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

