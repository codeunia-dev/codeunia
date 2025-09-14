import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { eventsService } from '@/lib/services/events'
import EventPageClient from './EventPageClient'

// ISR configuration
export const revalidate = 60 // Revalidate every minute

// Generate static params for popular events
export async function generateStaticParams() {
  try {
    const supabase = await createClient()
    
    // Fetch top 20 most popular events for pre-rendering
    const { data: events } = await supabase
      .from('events')
      .select('slug')
      .eq('status', 'live')
      .order('registered', { ascending: false })
      .limit(20)

    return events?.map((event) => ({
      slug: event.slug,
    })) || []
  } catch (error) {
    console.error('Error generating static params for events:', error)
    return []
  }
}

interface EventPageProps {
  params: Promise<{ slug: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
  
  try {
    // Fetch event data server-side
    const event = await eventsService.getEventBySlug(slug)
    
    if (!event) {
      notFound()
    }

    return <EventPageClient event={event} />
  } catch (error) {
    console.error('Error fetching event:', error)
    notFound()
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: EventPageProps) {
  const { slug } = await params
  
  try {
    const event = await eventsService.getEventBySlug(slug)
    
    if (!event) {
      return {
        title: 'Event Not Found',
        description: 'The requested event could not be found.',
      }
    }

    return {
      title: `${event.title} | CodeUnia Events`,
      description: event.excerpt,
      openGraph: {
        title: event.title,
        description: event.excerpt,
        type: 'website',
        images: event.image ? [event.image] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: event.title,
        description: event.excerpt,
        images: event.image ? [event.image] : [],
      },
    }
  } catch (error) {
    return {
      title: 'Event Not Found',
      description: 'The requested event could not be found.',
    }
  }
}
