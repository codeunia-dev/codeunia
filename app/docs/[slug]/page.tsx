import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { marked } from 'marked'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Force Node.js runtime for file system access
export const runtime = 'nodejs'

interface DocPageProps {
  params: Promise<{
    slug: string
  }>
}

const validDocs = [
  'company-registration-guide',
  'event-creation-guide',
  'team-management-guide',
  'moderation-guidelines',
]

export async function generateStaticParams() {
  return validDocs.map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params

  if (!validDocs.includes(slug)) {
    return {
      title: 'Documentation Not Found',
    }
  }

  const titles: Record<string, string> = {
    'company-registration-guide': 'Company Registration Guide',
    'event-creation-guide': 'Event Creation Guide',
    'team-management-guide': 'Team Management Guide',
    'moderation-guidelines': 'Moderation Guidelines',
  }

  return {
    title: `${titles[slug]} - CodeUnia`,
    description: `Comprehensive guide for ${titles[slug].toLowerCase()} on CodeUnia platform.`,
  }
}

async function getDocContent(slug: string): Promise<string | null> {
  try {
    const docsDirectory = path.join(process.cwd(), 'docs')
    const filePath = path.join(docsDirectory, `${slug}.md`)
    
    if (!fs.existsSync(filePath)) {
      return null
    }

    const fileContents = fs.readFileSync(filePath, 'utf8')
    const htmlContent = await marked(fileContents)
    return htmlContent
  } catch (error) {
    console.error('Error reading doc file:', error)
    return null
  }
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params

  if (!validDocs.includes(slug)) {
    notFound()
  }

  const content = await getDocContent(slug)

  if (!content) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/help/companies">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Button>
        </Link>
      </div>

      <article 
        className="prose prose-slate dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div className="mt-12 pt-8 border-t">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Was this helpful?</h3>
            <p className="text-sm text-muted-foreground">
              Let us know if you have feedback on this guide
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Yes
            </Button>
            <Button variant="outline" size="sm">
              No
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h4 className="font-semibold mb-2">Need more help?</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Contact our support team or browse more documentation
        </p>
        <div className="flex gap-4">
          <Link href="/companies/faq">
            <Button variant="outline" size="sm">
              View FAQ
            </Button>
          </Link>
          <a href="mailto:support@codeunia.com">
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
