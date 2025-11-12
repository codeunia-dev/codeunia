'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  // Company Registration
  {
    category: 'Company Registration',
    question: 'How long does company verification take?',
    answer: 'Company verification typically takes 2-3 business days. Complex cases may take up to 5 business days. You\'ll receive an email notification once your company is verified or if additional information is needed.',
  },
  {
    category: 'Company Registration',
    question: 'What documents do I need for verification?',
    answer: 'You need to upload at least one official document such as a business registration certificate, tax identification documents, business license, or certificate of incorporation. Documents must be current, clear, and readable.',
  },
  {
    category: 'Company Registration',
    question: 'Can I edit my company information after registration?',
    answer: 'Yes, you can update most company information from your company dashboard after verification. Changes to legal name or verification documents may require admin review.',
  },
  {
    category: 'Company Registration',
    question: 'What if my registration is rejected?',
    answer: 'If your registration is rejected, you\'ll receive an email with the specific reasons. Address the issues mentioned and submit a new registration with corrected information.',
  },
  {
    category: 'Company Registration',
    question: 'Can I register multiple companies?',
    answer: 'Yes, you can be a member of multiple companies with different roles in each. Each company requires separate registration and verification.',
  },

  // Event Creation
  {
    category: 'Event Creation',
    question: 'How long does event approval take?',
    answer: 'Event approval typically takes 24-48 hours. Pro and Enterprise tier companies with auto-approval get instant approval. You\'ll receive an email notification with the decision.',
  },
  {
    category: 'Event Creation',
    question: 'Can I create recurring events?',
    answer: 'Yes, create separate events for each occurrence with clear dates. You can duplicate existing events to save time when creating similar events.',
  },
  {
    category: 'Event Creation',
    question: 'What if I need to change the event date after approval?',
    answer: 'You can edit the event date from your dashboard. Minor changes are usually auto-approved. Major changes may require resubmission for review.',
  },
  {
    category: 'Event Creation',
    question: 'Can I delete an event?',
    answer: 'Yes, but registered participants will be notified. Consider canceling the event instead, which keeps the event visible but marks it as canceled.',
  },
  {
    category: 'Event Creation',
    question: 'What image size should I use for events?',
    answer: 'We recommend 1200x630px for optimal display across devices. Minimum resolution is 800x600px. Use high-quality images in JPG or PNG format.',
  },
  {
    category: 'Event Creation',
    question: 'How do I handle event registrations?',
    answer: 'You can use CodeUnia\'s built-in registration system or link to external platforms like Eventbrite. Both options track registrations in your analytics.',
  },

  // Team Management
  {
    category: 'Team Management',
    question: 'What\'s the difference between Admin and Editor roles?',
    answer: 'Admins can publish events and invite team members. Editors can only create draft events that need owner/admin approval before submission.',
  },
  {
    category: 'Team Management',
    question: 'Can I have multiple owners?',
    answer: 'No, only one owner per company. Ownership can be transferred to another admin if needed.',
  },
  {
    category: 'Team Management',
    question: 'What happens to events when a team member leaves?',
    answer: 'Events remain active and associated with the company, not the individual member. All event data and analytics are preserved.',
  },
  {
    category: 'Team Management',
    question: 'Can team members see each other\'s activity?',
    answer: 'Owners and Admins can see all team activity. Editors and Members see limited activity relevant to their role.',
  },
  {
    category: 'Team Management',
    question: 'How do I remove a team member?',
    answer: 'Go to Team Management, find the member, and click Remove. They\'ll lose access immediately and receive a notification email.',
  },

  // Subscription & Billing
  {
    category: 'Subscription & Billing',
    question: 'What are the subscription tier limits?',
    answer: 'Free: 2 events/month, 1 member. Basic: 10 events/month, 3 members. Pro: Unlimited events, 10 members, auto-approval. Enterprise: Unlimited everything with custom features.',
  },
  {
    category: 'Subscription & Billing',
    question: 'What happens if my subscription expires?',
    answer: 'Your existing events remain visible, but you cannot create new events until you renew. Team members retain access to view data.',
  },
  {
    category: 'Subscription & Billing',
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes, you can change your plan at any time from Company Settings → Subscription. Changes take effect immediately.',
  },
  {
    category: 'Subscription & Billing',
    question: 'Do I get a refund if I downgrade?',
    answer: 'Downgrades are prorated. You\'ll receive credit for the unused portion of your current plan applied to the new plan.',
  },
  {
    category: 'Subscription & Billing',
    question: 'What is auto-approval?',
    answer: 'Pro and Enterprise tiers get auto-approval, meaning events are published immediately after submission without manual admin review (automated checks still apply).',
  },

  // Analytics
  {
    category: 'Analytics',
    question: 'How often are analytics updated?',
    answer: 'Analytics are updated in real-time as events receive views and registrations. Daily aggregations run overnight for historical data.',
  },
  {
    category: 'Analytics',
    question: 'Can I export analytics data?',
    answer: 'Yes, you can export analytics data in CSV format from the Analytics dashboard. Select your date range and click Export.',
  },
  {
    category: 'Analytics',
    question: 'What is conversion rate?',
    answer: 'Conversion rate is the percentage of registration button clicks that resulted in actual registrations. Higher conversion rates indicate effective event pages.',
  },
  {
    category: 'Analytics',
    question: 'Why are my event views low?',
    answer: 'Promote your events on social media, include them in newsletters, and optimize your event title and description for search. High-quality images also improve click-through rates.',
  },

  // Troubleshooting
  {
    category: 'Troubleshooting',
    question: 'Why can\'t I create more events?',
    answer: 'You\'ve likely reached your subscription tier\'s monthly event limit. Upgrade your plan to create more events or wait until next month.',
  },
  {
    category: 'Troubleshooting',
    question: 'Why was my event rejected?',
    answer: 'Check the rejection email for specific reasons. Common issues include incomplete information, policy violations, poor quality images, or misleading content.',
  },
  {
    category: 'Troubleshooting',
    question: 'I can\'t invite team members. Why?',
    answer: 'Check that you have Owner or Admin role, haven\'t reached your team member limit, and your subscription is active.',
  },
  {
    category: 'Troubleshooting',
    question: 'My approved event isn\'t showing up. Why?',
    answer: 'Check that the event date hasn\'t passed, it\'s not set to draft status, and clear your browser cache. If issues persist, contact support.',
  },
  {
    category: 'Troubleshooting',
    question: 'How do I contact support?',
    answer: 'Email support@codeunia.com or visit /protected/help. Include your company name and detailed description of the issue.',
  },
]

export function CompanyFAQ() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))]

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
        <p className="text-muted-foreground mt-2">
          Find answers to common questions about company registration, event creation, and platform features.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No questions found matching your search. Try different keywords or browse all categories.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full text-left"
              >
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1">
                        {item.category}
                      </div>
                      <CardTitle className="text-lg">{item.question}</CardTitle>
                    </div>
                    <div className="flex-shrink-0">
                      {expandedItems.has(index) ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </button>
              {expandedItems.has(index) && (
                <CardContent className="pt-0">
                  <p className="text-muted-foreground">{item.answer}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Still Need Help */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
          <CardDescription>
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Email Support</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Get help from our support team
              </p>
              <a
                href="mailto:support@codeunia.com"
                className="text-sm text-primary hover:underline"
              >
                support@codeunia.com
              </a>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Help Center</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Browse guides and documentation
              </p>
              <Link
                href="/protected/help"
                className="text-sm text-primary hover:underline"
              >
                Visit Help Center →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
