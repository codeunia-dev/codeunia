import { Building2, Globe, Mail, Phone, MapPin, Calendar, Users, Award } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Company } from '@/types/company'
import { VerificationBadge } from '@/components/companies/VerificationBadge'
import { cn } from '@/lib/utils'

interface CompanyProfileProps {
  company: Company
  isOwner?: boolean
  className?: string
}

export function CompanyProfile({ company, isOwner = false, className }: CompanyProfileProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Banner and Logo Section */}
      <Card className="overflow-hidden">
        {/* Banner */}
        <div
          className="h-56 sm:h-64 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20"
          style={company.banner_url ? {
            backgroundImage: `url(${company.banner_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : undefined}
        />

        <CardHeader className="relative -mt-20 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Logo */}
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={company.logo_url} alt={company.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {company.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Company Name and Verification */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="text-3xl">{company.name}</CardTitle>
                <VerificationBadge
                  status={company.verification_status}
                  size="lg"
                  showLabel
                />
              </div>
              {company.legal_name && company.legal_name !== company.name && (
                <CardDescription className="text-sm">
                  Legal name: {company.legal_name}
                </CardDescription>
              )}
              <div className="flex flex-wrap gap-2">
                {company.industry && (
                  <Badge variant="secondary">
                    <Building2 className="h-3 w-3 mr-1" />
                    {company.industry.charAt(0).toUpperCase() + company.industry.slice(1)}
                  </Badge>
                )}
                {company.company_size && (
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {company.company_size.charAt(0).toUpperCase() + company.company_size.slice(1)}
                  </Badge>
                )}
                {company.subscription_tier !== 'free' && (
                  <Badge variant="default">
                    <Award className="h-3 w-3 mr-1" />
                    {company.subscription_tier.charAt(0).toUpperCase() + company.subscription_tier.slice(1)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Button */}
            {isOwner && (
              <Button variant="outline" asChild>
                <a href={`/dashboard/company/settings`}>
                  Edit Profile
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* About and Contact Information */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* About Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.description ? (
              <p className="text-muted-foreground leading-relaxed">
                {company.description}
              </p>
            ) : (
              <p className="text-muted-foreground italic">
                No description available
              </p>
            )}

            <Separator />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">
                  {company.approved_events_count ?? company.total_events ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Events Hosted</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">
                  {company.approved_hackathons_count ?? company.total_hackathons ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Hackathons</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">
                  {company.total_participants ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.website && (
              <div className="flex items-start gap-3">
                <Globe className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Website</p>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {company.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            )}

            {company.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <a
                    href={`mailto:${company.email}`}
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {company.email}
                  </a>
                </div>
              </div>
            )}

            {company.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <a
                    href={`tel:${company.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {company.phone}
                  </a>
                </div>
              </div>
            )}

            {company.address && (company.address.city || company.address.country) && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <p className="text-sm">
                    {[
                      company.address.city,
                      company.address.state,
                      company.address.country
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {company.created_at && (
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Member since</p>
                  <p className="text-sm">
                    {formatDate(company.created_at)}
                  </p>
                </div>
              </div>
            )}

            {/* Social Links */}
            {company.socials && Object.keys(company.socials).length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Social Media</p>
                  <div className="flex flex-wrap gap-2">
                    {company.socials.linkedin && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={company.socials.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {company.socials.twitter && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={company.socials.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Twitter
                        </a>
                      </Button>
                    )}
                    {company.socials.facebook && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={company.socials.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Facebook
                        </a>
                      </Button>
                    )}
                    {company.socials.instagram && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={company.socials.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Instagram
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
