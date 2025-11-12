import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Company } from '@/types/company'
import { VerificationBadge } from '@/components/companies/VerificationBadge'
import { cn } from '@/lib/utils'

interface CompanyBadgeProps {
  company: Company
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  showVerification?: boolean
  className?: string
}

const sizeClasses = {
  sm: {
    avatar: 'h-6 w-6',
    text: 'text-xs',
    icon: 'h-3 w-3',
  },
  md: {
    avatar: 'h-8 w-8',
    text: 'text-sm',
    icon: 'h-4 w-4',
  },
  lg: {
    avatar: 'h-10 w-10',
    text: 'text-base',
    icon: 'h-5 w-5',
  },
}

export function CompanyBadge({ 
  company, 
  size = 'md', 
  showName = true,
  showVerification = true,
  className 
}: CompanyBadgeProps) {
  const sizes = sizeClasses[size]

  const content = (
    <div className={cn(
      "inline-flex items-center gap-2 group",
      className
    )}>
      <Avatar className={cn(sizes.avatar, "border border-border")}>
        <AvatarImage src={company.logo_url} alt={company.name} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
          {company.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      {showName && (
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "font-medium group-hover:text-primary transition-colors",
            sizes.text
          )}>
            {company.name}
          </span>
          {showVerification && company.verification_status === 'verified' && (
            <VerificationBadge status="verified" size={size} />
          )}
        </div>
      )}
    </div>
  )

  if (showName) {
    return (
      <Link href={`/companies/${company.slug}`} className="inline-block">
        {content}
      </Link>
    )
  }

  return content
}
