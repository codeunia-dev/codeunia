'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, AlertCircle, Calendar, Users, FileText, Zap, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Company, SUBSCRIPTION_LIMITS } from '@/types/company'
import { toast } from 'sonner'

interface SubscriptionUsage {
  events_this_month: number
  team_members: number
  limits: {
    events_per_month: number | null
    team_members: number | null
    auto_approval: boolean
    api_access: boolean
    custom_branding: boolean
    priority_support: boolean
  }
  can_create_event: boolean
  can_add_team_member: boolean
  events_remaining: number | null
  team_members_remaining: number | null
  subscription_expires_soon: boolean
  days_until_expiry: number | null
}

interface SubscriptionManagementProps {
  company: Company
  userRole: string
}

const TIER_INFO = {
  free: {
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: FileText,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  basic: {
    name: 'Basic',
    price: '$49',
    period: 'per month',
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  pro: {
    name: 'Pro',
    price: '$149',
    period: 'per month',
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    icon: Crown,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
}

export function SubscriptionManagement({
  company,
  userRole,
}: SubscriptionManagementProps) {
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  const fetchUsage = useCallback(async () => {
    try {
      const response = await fetch(`/api/companies/${company.slug}/subscription/usage`)
      if (!response.ok) throw new Error('Failed to fetch usage')
      const data = await response.json()
      setUsage(data.usage)
    } catch (error) {
      console.error('Error fetching usage:', error)
      toast.error('Failed to load subscription usage')
    } finally {
      setLoading(false)
    }
  }, [company.slug])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  const handleUpgrade = async (tier: string) => {
    if (userRole !== 'owner') {
      toast.error('Only company owners can upgrade subscriptions')
      return
    }

    setUpgrading(true)
    try {
      const response = await fetch(`/api/companies/${company.slug}/subscription/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })

      if (!response.ok) throw new Error('Failed to upgrade')

      await response.json()
      toast.success(`Successfully upgraded to ${tier} plan!`)
      
      // Refresh the page to show updated subscription
      window.location.reload()
    } catch (error) {
      console.error('Error upgrading:', error)
      toast.error('Failed to upgrade subscription')
    } finally {
      setUpgrading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (userRole !== 'owner') {
      toast.error('Only company owners can cancel subscriptions')
      return
    }

    if (!confirm('Are you sure you want to cancel your subscription? You will be downgraded to the Free plan.')) {
      return
    }

    try {
      const response = await fetch(`/api/companies/${company.slug}/subscription/cancel`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to cancel')

      toast.success('Subscription cancelled successfully')
      window.location.reload()
    } catch (error) {
      console.error('Error cancelling:', error)
      toast.error('Failed to cancel subscription')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!usage) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load subscription information</AlertDescription>
      </Alert>
    )
  }

  const currentTierInfo = TIER_INFO[company.subscription_tier]
  const TierIcon = currentTierInfo.icon

  return (
    <div className="space-y-6">
      {/* Expiry Warning */}
      {usage.subscription_expires_soon && usage.days_until_expiry !== null && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900 dark:text-orange-100">
            Subscription Expiring Soon
          </AlertTitle>
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            Your subscription will expire in {usage.days_until_expiry} day
            {usage.days_until_expiry !== 1 ? 's' : ''}. Renew now to avoid service interruption.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${currentTierInfo.bgColor}`}>
                <TierIcon className={`h-6 w-6 ${currentTierInfo.color}`} />
              </div>
              <div>
                <CardTitle>Current Plan: {currentTierInfo.name}</CardTitle>
                <CardDescription>
                  {currentTierInfo.price} {currentTierInfo.period}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={company.subscription_status === 'active' ? 'default' : 'secondary'}
            >
              {company.subscription_status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Events Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Events This Month</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.events_this_month} /{' '}
                  {usage.limits.events_per_month === null
                    ? '∞'
                    : usage.limits.events_per_month}
                </span>
              </div>
              <Progress
                value={
                  usage.limits.events_per_month === null
                    ? 0
                    : (usage.events_this_month / usage.limits.events_per_month) * 100
                }
                className="h-2"
              />
              {usage.events_remaining !== null && usage.events_remaining <= 2 && (
                <p className="text-xs text-orange-600 mt-1">
                  Only {usage.events_remaining} event{usage.events_remaining !== 1 ? 's' : ''}{' '}
                  remaining
                </p>
              )}
            </div>

            {/* Team Members Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Team Members</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {usage.team_members} /{' '}
                  {usage.limits.team_members === null ? '∞' : usage.limits.team_members}
                </span>
              </div>
              <Progress
                value={
                  usage.limits.team_members === null
                    ? 0
                    : (usage.team_members / usage.limits.team_members) * 100
                }
                className="h-2"
              />
              {usage.team_members_remaining !== null && usage.team_members_remaining <= 1 && (
                <p className="text-xs text-orange-600 mt-1">
                  Only {usage.team_members_remaining} slot{usage.team_members_remaining !== 1 ? 's' : ''}{' '}
                  remaining
                </p>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-medium mb-3">Plan Features</h4>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Check
                  className={`h-4 w-4 ${usage.limits.auto_approval ? 'text-green-600' : 'text-gray-400'}`}
                />
                <span className="text-sm">Auto-approval</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check
                  className={`h-4 w-4 ${usage.limits.api_access ? 'text-green-600' : 'text-gray-400'}`}
                />
                <span className="text-sm">API Access</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check
                  className={`h-4 w-4 ${usage.limits.custom_branding ? 'text-green-600' : 'text-gray-400'}`}
                />
                <span className="text-sm">Custom Branding</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check
                  className={`h-4 w-4 ${usage.limits.priority_support ? 'text-green-600' : 'text-gray-400'}`}
                />
                <span className="text-sm">Priority Support</span>
              </div>
            </div>
          </div>
        </CardContent>
        {company.subscription_tier !== 'free' && userRole === 'owner' && (
          <CardFooter>
            <Button variant="outline" onClick={handleCancelSubscription}>
              Cancel Subscription
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Available Plans */}
      {company.subscription_tier !== 'enterprise' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Upgrade Your Plan</h2>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="pro">Pro</TabsTrigger>
              <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
            </TabsList>

            {(['basic', 'pro', 'enterprise'] as const).map((tier) => {
              const tierInfo = TIER_INFO[tier]
              const limits = SUBSCRIPTION_LIMITS[tier]
              const TierIcon = tierInfo.icon
              const isCurrentTier = company.subscription_tier === tier

              return (
                <TabsContent key={tier} value={tier}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-lg ${tierInfo.bgColor}`}>
                            <TierIcon className={`h-6 w-6 ${tierInfo.color}`} />
                          </div>
                          <div>
                            <CardTitle>{tierInfo.name} Plan</CardTitle>
                            <CardDescription>
                              <span className="text-2xl font-bold text-foreground">
                                {tierInfo.price}
                              </span>{' '}
                              {tierInfo.period}
                            </CardDescription>
                          </div>
                        </div>
                        {isCurrentTier && <Badge>Current Plan</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span>
                            {limits.events_per_month === null
                              ? 'Unlimited events'
                              : `${limits.events_per_month} events per month`}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span>
                            {limits.team_members === null
                              ? 'Unlimited team members'
                              : `Up to ${limits.team_members} team members`}
                          </span>
                        </li>
                        {limits.auto_approval && (
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Auto-approval for events</span>
                          </li>
                        )}
                        {limits.api_access && (
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>API access</span>
                          </li>
                        )}
                        {limits.custom_branding && (
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Custom branding</span>
                          </li>
                        )}
                        {limits.priority_support && (
                          <li className="flex items-start">
                            <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Priority support</span>
                          </li>
                        )}
                        {tier === 'enterprise' && (
                          <>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                              <span>Dedicated account manager</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                              <span>Custom integrations</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                              <span>SLA guarantee</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      {isCurrentTier ? (
                        <Button disabled className="w-full">
                          Current Plan
                        </Button>
                      ) : tier === 'enterprise' ? (
                        <Button
                          className="w-full"
                          onClick={() => window.open('mailto:sales@codeunia.com', '_blank')}
                        >
                          Contact Sales
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handleUpgrade(tier)}
                          disabled={upgrading || userRole !== 'owner'}
                        >
                          {upgrading ? 'Processing...' : `Upgrade to ${tierInfo.name}`}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </TabsContent>
              )
            })}
          </Tabs>
        </div>
      )}
    </div>
  )
}
