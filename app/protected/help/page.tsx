'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { 
  Search, 
  HelpCircle, 
  Mail, 
  MessageSquare, 
  BookOpen, 
  Settings, 
  Shield, 
  Users,
  Trophy,
  Calendar,
  Code,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Bug,
  ChevronRight,
  Lightbulb,
  X,
  ChevronsDown,
  ChevronsUp
} from 'lucide-react'

const quickActions = [
  { icon: Shield, title: 'Reset Password', description: 'Change your account password', href: '/protected/settings' },
  { icon: Users, title: 'Update Profile', description: 'Edit your profile information', href: '/protected/profile/view' },
  { icon: Mail, title: 'Contact Support', description: 'Get help from our team', action: 'contact' },
  { icon: Bug, title: 'Report a Bug', description: 'Help us improve the platform', action: 'bug' },
]

const popularTopics = [
  'How do I reset my password?',
  'How do I enroll in a course?',
  'How do I send a message?',
  'Where can I see my test results?',
  'How do I add connections?',
]

const faqCategories = [
  {
    title: 'Getting Started',
    icon: BookOpen,
    faqs: [
      {
        question: 'How do I complete my profile?',
        answer: 'Go to your profile page by clicking on your avatar in the sidebar, then click "Edit Profile". Fill in all required fields including your bio, skills, and education details.'
      },
      {
        question: 'How do I navigate the platform?',
        answer: 'Use the sidebar on the left to access different sections. On mobile, tap the menu icon in the top-left corner. The dashboard gives you an overview of all your activities.'
      },
      {
        question: 'What are the main features available?',
        answer: 'Codeunia offers courses, assignments, tests, hackathons, events, messaging, connections, study groups, mentorship, and career opportunities all in one platform.'
      }
    ]
  },
  {
    title: 'Courses & Learning',
    icon: BookOpen,
    faqs: [
      {
        question: 'How do I enroll in a course?',
        answer: 'Navigate to "My Courses" from the sidebar, browse available courses, and click "Enroll" on any course you\'re interested in. Some courses may have prerequisites.'
      },
      {
        question: 'Where can I find my assignments?',
        answer: 'All your assignments are listed in the "Assignments" section. You can filter by course, due date, or status (pending, submitted, graded).'
      },
      {
        question: 'How do I submit an assignment?',
        answer: 'Open the assignment, complete the required work, and click "Submit". You can attach files, add links, or write text responses depending on the assignment type.'
      }
    ]
  },
  {
    title: 'Tests & Assessments',
    icon: Trophy,
    faqs: [
      {
        question: 'How do I take a test?',
        answer: 'Go to "Test Dashboard" or "Browse Tests", select a test, and click "Start Test". Make sure you have a stable internet connection and enough time to complete it.'
      },
      {
        question: 'Can I retake a test?',
        answer: 'It depends on the test settings. Some tests allow multiple attempts while others are one-time only. Check the test details before starting.'
      },
      {
        question: 'Where can I see my test results?',
        answer: 'Your test results are available in "Grades & Progress" section. You can view detailed feedback, correct answers, and your performance analytics.'
      }
    ]
  },
  {
    title: 'Messages & Connections',
    icon: MessageSquare,
    faqs: [
      {
        question: 'How do I send a message?',
        answer: 'Go to the Messages section, click "New Message", search for the person you want to message, and start chatting. You can also message from their profile.'
      },
      {
        question: 'How do I add connections?',
        answer: 'Visit the Connections page, use the search tab to find users, and click "Follow" on their profile. They can follow you back to create a mutual connection.'
      },
      {
        question: 'Can I create group chats?',
        answer: 'Yes! In the Messages section, click "New Message" and select multiple recipients to create a group conversation.'
      }
    ]
  },
  {
    title: 'Events & Activities',
    icon: Calendar,
    faqs: [
      {
        question: 'How do I join a hackathon?',
        answer: 'Browse available hackathons in the "Hackathons" section, read the details, and click "Register". You can participate individually or as a team.'
      },
      {
        question: 'How do I register for events?',
        answer: 'Go to "Events & Workshops", find an event you\'re interested in, and click "Register". You\'ll receive confirmation and reminders via email.'
      },
      {
        question: 'Can I create my own project?',
        answer: 'Yes! Visit the "Projects" section and click "Create Project". Add details, invite collaborators, and showcase your work to the community.'
      }
    ]
  },
  {
    title: 'Technical Issues',
    icon: Code,
    faqs: [
      {
        question: 'I can\'t log in to my account',
        answer: 'Try resetting your password using the "Forgot Password" link. If that doesn\'t work, clear your browser cache or try a different browser. Contact support if the issue persists.'
      },
      {
        question: 'The page is loading slowly',
        answer: 'Check your internet connection. Try refreshing the page or clearing your browser cache. If the issue continues, it might be temporary server maintenance.'
      },
      {
        question: 'I\'m not receiving email notifications',
        answer: 'Check your spam folder. Verify your email address in Settings. Make sure notifications are enabled in your account preferences.'
      }
    ]
  },
  {
    title: 'Account & Settings',
    icon: Settings,
    faqs: [
      {
        question: 'How do I change my password?',
        answer: 'Go to Settings, click on "Security", and select "Change Password". Enter your current password and your new password twice to confirm.'
      },
      {
        question: 'How do I manage notifications?',
        answer: 'Visit Settings > Notifications to customize which notifications you receive via email, push, or in-app alerts.'
      },
      {
        question: 'Can I delete my account?',
        answer: 'Yes, but this action is permanent. Go to Settings > Account > Delete Account. You\'ll need to confirm this action and all your data will be removed.'
      }
    ]
  }
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [filteredFaqs, setFilteredFaqs] = useState(faqCategories)
  const [resultsCount, setResultsCount] = useState(0)
  const [showContactForm, setShowContactForm] = useState(false)
  const [showBugForm, setShowBugForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  
  // Contact form state
  const [contactSubject, setContactSubject] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [contactErrors, setContactErrors] = useState({ subject: '', message: '' })
  
  // Bug form state
  const [bugTitle, setBugTitle] = useState('')
  const [bugDescription, setBugDescription] = useState('')
  const [bugSubmitting, setBugSubmitting] = useState(false)
  const [bugErrors, setBugErrors] = useState({ title: '', description: '' })

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Handle ESC key for dialogs
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showContactForm) setShowContactForm(false)
        if (showBugForm) setShowBugForm(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [showContactForm, showBugForm])

  // Perform search with debounced query
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setFilteredFaqs(faqCategories)
      setResultsCount(0)
      return
    }

    const filtered = faqCategories.map(category => ({
      ...category,
      faqs: category.faqs.filter(faq => 
        faq.question.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    })).filter(category => category.faqs.length > 0)

    const count = filtered.reduce((acc, category) => acc + category.faqs.length, 0)
    setResultsCount(count)
    setFilteredFaqs(filtered)
  }, [debouncedQuery])

  const clearSearch = () => {
    setSearchQuery('')
    setDebouncedQuery('')
  }

  const expandAll = useCallback(() => {
    const allItems: string[] = []
    filteredFaqs.forEach((category, catIndex) => {
      category.faqs.forEach((_, faqIndex) => {
        allItems.push(`item-${catIndex}-${faqIndex}`)
      })
    })
    setExpandedItems(allItems)
  }, [filteredFaqs])

  const collapseAll = () => {
    setExpandedItems([])
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return (
      <span>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <mark key={index} className="bg-blue-500/30 text-blue-300 rounded px-0.5">{part}</mark>
            : <span key={index}>{part}</span>
        )}
      </span>
    )
  }

  const handleQuickAction = (action: string) => {
    if (action === 'contact') {
      setShowContactForm(true)
    } else if (action === 'bug') {
      setShowBugForm(true)
    }
  }

  const handleContactSubmit = async () => {
    // Validate form
    const errors = { subject: '', message: '' }
    let hasErrors = false

    if (!contactSubject.trim()) {
      errors.subject = 'Subject is required'
      hasErrors = true
    } else if (contactSubject.length < 5) {
      errors.subject = 'Subject must be at least 5 characters'
      hasErrors = true
    }

    if (!contactMessage.trim()) {
      errors.message = 'Message is required'
      hasErrors = true
    } else if (contactMessage.length < 20) {
      errors.message = 'Message must be at least 20 characters'
      hasErrors = true
    }

    setContactErrors(errors)
    if (hasErrors) return

    setContactSubmitting(true)
    
    try {
      const response = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: contactSubject,
          message: contactMessage,
        }),
      })

      if (response.ok) {
        toast.success("Message sent successfully!", {
          description: "We'll get back to you within 24-48 hours.",
        })
        setContactSubject('')
        setContactMessage('')
        setContactErrors({ subject: '', message: '' })
        setShowContactForm(false)
      } else {
        const error = await response.json()
        toast.error("Failed to send message", {
          description: error.error || 'Please try again later.',
        })
      }
    } catch (error) {
      console.error('Error sending contact message:', error)
      toast.error("Failed to send message", {
        description: 'Please check your connection and try again.',
      })
    } finally {
      setContactSubmitting(false)
    }
  }

  const handleBugSubmit = async () => {
    // Validate form
    const errors = { title: '', description: '' }
    let hasErrors = false

    if (!bugTitle.trim()) {
      errors.title = 'Bug title is required'
      hasErrors = true
    } else if (bugTitle.length < 10) {
      errors.title = 'Title must be at least 10 characters'
      hasErrors = true
    }

    if (!bugDescription.trim()) {
      errors.description = 'Description is required'
      hasErrors = true
    } else if (bugDescription.length < 30) {
      errors.description = 'Description must be at least 30 characters'
      hasErrors = true
    }

    setBugErrors(errors)
    if (hasErrors) return

    setBugSubmitting(true)
    
    try {
      const response = await fetch('/api/support/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: bugTitle,
          description: bugDescription,
        }),
      })

      if (response.ok) {
        toast.success("Bug report submitted!", {
          description: "Thank you for helping us improve the platform.",
        })
        setBugTitle('')
        setBugDescription('')
        setBugErrors({ title: '', description: '' })
        setShowBugForm(false)
      } else {
        const error = await response.json()
        toast.error("Failed to submit bug report", {
          description: error.error || 'Please try again later.',
        })
      }
    } catch (error) {
      console.error('Error submitting bug report:', error)
      toast.error("Failed to submit bug report", {
        description: 'Please check your connection and try again.',
      })
    } finally {
      setBugSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-black overflow-hidden">
        {/* Header Skeleton */}
        <div className="border-b border-zinc-800 bg-black p-4 flex-shrink-0">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-lg bg-zinc-800" />
              <Skeleton className="h-8 w-32 bg-zinc-800" />
            </div>
            <Skeleton className="h-4 w-96 bg-zinc-800" />
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="flex-1 overflow-y-auto bg-black">
          <div className="max-w-5xl mx-auto p-4 space-y-8">
            <Skeleton className="h-12 w-full bg-zinc-800" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 bg-zinc-800" />
              ))}
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 bg-zinc-800" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-black overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-black p-4 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <HelpCircle className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Help Center</h1>
          </div>
          <p className="text-zinc-400 text-sm md:text-base">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-black">
        <div className="max-w-5xl mx-auto p-4 space-y-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-12 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Quick Actions */}
          {!searchQuery && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  if (action.href) {
                    return (
                      <Link key={index} href={action.href}>
                        <Card className="bg-zinc-900 border-zinc-800 hover:border-blue-500/50 transition-all duration-300 cursor-pointer h-full group hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 group-hover:from-blue-500/30 group-hover:to-purple-600/30 transition-colors">
                                  <action.icon className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                  <CardTitle className="text-white text-base">{action.title}</CardTitle>
                                  <CardDescription className="text-zinc-400 text-sm">
                                    {action.description}
                                  </CardDescription>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                            </div>
                          </CardHeader>
                        </Card>
                      </Link>
                    )
                  }
                  
                  return (
                    <div key={index} onClick={() => handleQuickAction(action.action || '')}>
                      <Card className="bg-zinc-900 border-zinc-800 hover:border-blue-500/50 transition-all duration-300 cursor-pointer h-full group hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 group-hover:from-blue-500/30 group-hover:to-purple-600/30 transition-colors">
                                <action.icon className="h-5 w-5 text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-white text-base">{action.title}</CardTitle>
                                <CardDescription className="text-zinc-400 text-sm">
                                  {action.description}
                                </CardDescription>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                          </div>
                        </CardHeader>
                      </Card>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* FAQ Categories */}
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-white">
                {debouncedQuery ? 'Search Results' : 'Frequently Asked Questions'}
              </h2>
              <div className="flex items-center gap-2">
                {debouncedQuery && resultsCount > 0 && (
                  <span className="text-sm text-zinc-400">
                    Found {resultsCount} result{resultsCount !== 1 ? 's' : ''} for &quot;{debouncedQuery}&quot;
                  </span>
                )}
                {filteredFaqs.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={expandAll}
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      <ChevronsDown className="h-4 w-4 mr-1" />
                      Expand All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={collapseAll}
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      <ChevronsUp className="h-4 w-4 mr-1" />
                      Collapse All
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {filteredFaqs.length === 0 ? (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
                  <div className="p-4 rounded-full bg-zinc-800">
                    <AlertCircle className="h-12 w-12 text-zinc-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium mb-2">No results found for &quot;{searchQuery}&quot;</p>
                    <p className="text-zinc-400 text-sm mb-4">Try different keywords or browse popular topics</p>
                  </div>
                  <div className="w-full max-w-md">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-blue-400" />
                      <p className="text-sm font-medium text-zinc-300">Popular Topics:</p>
                    </div>
                    <div className="space-y-2">
                      {popularTopics.map((topic, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(topic.split(' ').slice(-2).join(' '))}
                          className="w-full text-left px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm transition-colors"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredFaqs.map((category, categoryIndex) => (
                  <Card key={categoryIndex} className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20">
                          <category.icon className="h-5 w-5 text-blue-400" />
                        </div>
                        <CardTitle className="text-white">{category.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Accordion 
                        type="multiple" 
                        value={expandedItems}
                        onValueChange={setExpandedItems}
                        className="w-full"
                      >
                        {category.faqs.map((faq, faqIndex) => (
                          <AccordionItem 
                            key={faqIndex} 
                            value={`item-${categoryIndex}-${faqIndex}`}
                            className="border-zinc-800"
                          >
                            <AccordionTrigger className="text-left text-white hover:text-blue-400 hover:no-underline">
                              {highlightText(faq.question, debouncedQuery)}
                            </AccordionTrigger>
                            <AccordionContent className="text-zinc-400">
                              {highlightText(faq.answer, debouncedQuery)}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Contact Support Section */}
          {!searchQuery && (
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  Still Need Help?
                </CardTitle>
                <CardDescription className="text-zinc-300">
                  Our support team is here to assist you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <Mail className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Email Support</p>
                    <p className="text-zinc-400">support@codeunia.com</p>
                    <p className="text-zinc-500 text-xs mt-1">Response time: 24-48 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Clock className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Support Hours</p>
                    <p className="text-zinc-400">Monday - Friday: 9:00 AM - 6:00 PM IST</p>
                    <p className="text-zinc-400">Saturday: 10:00 AM - 4:00 PM IST</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowContactForm(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          )}

          {/* System Status */}
          {!searchQuery && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">All Systems Operational</p>
                    <p className="text-zinc-400 text-sm">Last checked: Just now</p>
                  </div>
                  <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                    View Details
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Contact Support Dialog */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowContactForm(false)}>
          <Card className="bg-zinc-900 border-zinc-800 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-400" />
                Contact Support
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Send us a message and we&apos;ll get back to you soon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-zinc-300 mb-2 block">Subject</label>
                <Input 
                  placeholder="What do you need help with?"
                  value={contactSubject}
                  onChange={(e) => {
                    setContactSubject(e.target.value)
                    if (contactErrors.subject) setContactErrors({ ...contactErrors, subject: '' })
                  }}
                  disabled={contactSubmitting}
                  className={`bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 ${contactErrors.subject ? 'border-red-500' : ''}`}
                />
                {contactErrors.subject && (
                  <p className="text-red-400 text-xs mt-1">{contactErrors.subject}</p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-zinc-300">Message</label>
                  <span className="text-xs text-zinc-500">{contactMessage.length}/500</span>
                </div>
                <textarea 
                  placeholder="Describe your issue in detail..."
                  value={contactMessage}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setContactMessage(e.target.value)
                      if (contactErrors.message) setContactErrors({ ...contactErrors, message: '' })
                    }
                  }}
                  disabled={contactSubmitting}
                  rows={5}
                  className={`w-full bg-zinc-800 border rounded-md p-3 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none disabled:opacity-50 ${contactErrors.message ? 'border-red-500' : 'border-zinc-700'}`}
                />
                {contactErrors.message && (
                  <p className="text-red-400 text-xs mt-1">{contactErrors.message}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowContactForm(false)}
                  variant="outline" 
                  disabled={contactSubmitting}
                  className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleContactSubmit}
                  disabled={contactSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                >
                  {contactSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bug Report Dialog */}
      {showBugForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowBugForm(false)}>
          <Card className="bg-zinc-900 border-zinc-800 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                Report a Bug
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Help us improve by reporting issues you encounter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-zinc-300 mb-2 block">Bug Title</label>
                <Input 
                  placeholder="Brief description of the bug"
                  value={bugTitle}
                  onChange={(e) => {
                    setBugTitle(e.target.value)
                    if (bugErrors.title) setBugErrors({ ...bugErrors, title: '' })
                  }}
                  disabled={bugSubmitting}
                  className={`bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 ${bugErrors.title ? 'border-red-500' : ''}`}
                />
                {bugErrors.title && (
                  <p className="text-red-400 text-xs mt-1">{bugErrors.title}</p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-zinc-300">What happened?</label>
                  <span className="text-xs text-zinc-500">{bugDescription.length}/1000</span>
                </div>
                <textarea 
                  placeholder="Describe what you were doing when the bug occurred..."
                  value={bugDescription}
                  onChange={(e) => {
                    if (e.target.value.length <= 1000) {
                      setBugDescription(e.target.value)
                      if (bugErrors.description) setBugErrors({ ...bugErrors, description: '' })
                    }
                  }}
                  disabled={bugSubmitting}
                  rows={5}
                  className={`w-full bg-zinc-800 border rounded-md p-3 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none disabled:opacity-50 ${bugErrors.description ? 'border-red-500' : 'border-zinc-700'}`}
                />
                {bugErrors.description && (
                  <p className="text-red-400 text-xs mt-1">{bugErrors.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowBugForm(false)}
                  variant="outline" 
                  disabled={bugSubmitting}
                  className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleBugSubmit}
                  disabled={bugSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                >
                  {bugSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
