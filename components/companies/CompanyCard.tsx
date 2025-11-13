import Link from 'next/link'
import { MapPin, Users, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Company } from '@/types/company'
import { VerificationBadge } from '@/components/companies/VerificationBadge'
import { cn } from '@/lib/utils'

interface CompanyCardProps {
  company: Company
  showStats?: boolean
  showVerificationBadge?: boolean
  className?: string
}

export function CompanyCard({ 
  company, 
  showStats = true, 
  showVerificationBadge = true,
  className 
}: CompanyCardProps) {
  return (
    <Link href={`/companies/${company.slug}`}>
      <Card className={cn(
        "group hover:shadow-lg transition-all duration-200 hover:border-primary/50 cursor-pointer h-full",
        className
      )}>
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-12 w-12 border-2 border-border">
                <AvatarImage src={company.logo_url} alt={company.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {company.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                  {company.name}
                </CardTitle>
                {company.industry && (
                  <CardDescription className="text-xs mt-1">
                    {company.industry.charAt(0).toUpperCase() + company.industry.slice(1)}
                  </CardDescription>
                )}
              </div>
            </div>
            {showVerificationBadge && (
              <VerificationBadge status={company.verification_status} size="sm" />
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {company.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {company.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {company.company_size && (
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {company.company_size.charAt(0).toUpperCase() + company.company_size.slice(1)}
              </Badge>
            )}
            {company.address?.city && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {company.address.city}
                {company.address.country && `, ${company.address.country}`}
              </Badge>
            )}
          </div>
        </CardContent>

        {showStats && (
          <CardFooter className="border-t pt-4">
            <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{company.total_events} events</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{company.total_participants} participants</span>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  )
}
