'use client'

import { AlertCircle, ArrowRight, Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface UpgradePromptProps {
  currentTier: 'free' | 'basic' | 'pro' | 'enterprise'
  reason: string
  limitType: 'events' | 'team_members'
  currentUsage: number
  limit: number
  onUpgrade?: () => void
  variant?: 'inline' | 'modal' | 'banner'
}

const TIER_FEATURES = {
  basic: [
    '10 events per month',
    'Up to 3 team members',
    'Custom branding',
    'Email support',
  ],
  pro: [
    'Unlimited events',
    'Up to 10 team members',
    'Auto-approval for events',
    'API access',
    'Priority support',
    'Advanced analytics',
  ],
  enterprise: [
    'Unlimited events',
    'Unlimited team members',
    'Dedicated account manager',
    'Custom integrations',
    'SLA guarantee',
    'White-label options',
  ],
}

const TIER_PRICES = {
  basic: '$49/month',
  pro: '$149/month',
  enterprise: 'Custom pricing',
}

export function UpgradePrompt({
  currentTier,
  reason,
  limitType,
  currentUsage,
  limit,
  onUpgrade,
  variant = 'inline',
}: UpgradePromptProps) {
  // Determine recommended tier
  const recommendedTier =
    currentTier === 'free' ? 'basic' : currentTier === 'basic' ? 'pro' : 'enterprise'

  const features = TIER_FEATURES[recommendedTier]
  const price = TIER_PRICES[recommendedTier]

  if (variant === 'banner') {
    return (
      <Alert className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
        <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertTitle className="text-orange-900 dark:text-orange-100">
          Subscription Limit Reached
        </AlertTitle>
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1">{reason}</p>
              <p className="text-sm">
                Current usage: {currentUsage} / {limit}
              </p>
            </div>
            <Button
              onClick={onUpgrade}
              variant="default"
              className="ml-4 bg-orange-600 hover:bg-orange-700"
            >
              Upgrade Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (variant === 'modal') {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Upgrade Your Plan</CardTitle>
              <CardDescription className="mt-2">{reason}</CardDescription>
            </div>
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              {currentTier.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {limitType === 'events' ? 'Events this month' : 'Team members'}
              </span>
              <span className="text-sm font-medium">
                {currentUsage} / {limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${Math.min((currentUsage / limit) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold capitalize">{recommendedTier} Plan</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {price}
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>

            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Maybe Later
          </Button>
          <Button onClick={onUpgrade} size="lg" className="bg-blue-600 hover:bg-blue-700">
            Upgrade to {recommendedTier}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Default inline variant
  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
            <div>
              <CardTitle className="text-lg text-orange-900 dark:text-orange-100">
                Upgrade Required
              </CardTitle>
              <CardDescription className="text-orange-800 dark:text-orange-200 mt-1">
                {reason}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            {currentTier.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-orange-800 dark:text-orange-200">
              Current usage
            </span>
            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
              {currentUsage} / {limit}
            </span>
          </div>
          <div className="w-full bg-orange-200 rounded-full h-2 dark:bg-orange-900">
            <div
              className="bg-orange-600 h-2 rounded-full"
              style={{ width: `${Math.min((currentUsage / limit) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="text-sm text-orange-800 dark:text-orange-200">
          <p className="font-medium mb-2">Upgrade to {recommendedTier} to get:</p>
          <ul className="space-y-1 ml-4">
            {features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-2" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onUpgrade}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          Upgrade to {recommendedTier} - {price}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
