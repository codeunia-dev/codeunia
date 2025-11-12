'use client'

import { AlertCircle, ArrowRight } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface SubscriptionExpiryWarningProps {
  daysUntilExpiry: number
  companySlug: string
  variant?: 'banner' | 'card'
}

export function SubscriptionExpiryWarning({
  daysUntilExpiry,
  companySlug,
  variant = 'banner',
}: SubscriptionExpiryWarningProps) {
  const router = useRouter()

  const handleRenew = () => {
    router.push(`/dashboard/company/${companySlug}/subscription`)
  }

  const getUrgencyColor = () => {
    if (daysUntilExpiry <= 3) return 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
    if (daysUntilExpiry <= 7) return 'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950'
    return 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950'
  }

  const getIconColor = () => {
    if (daysUntilExpiry <= 3) return 'text-red-600 dark:text-red-400'
    if (daysUntilExpiry <= 7) return 'text-orange-600 dark:text-orange-400'
    return 'text-yellow-600 dark:text-yellow-400'
  }

  const getTextColor = () => {
    if (daysUntilExpiry <= 3) return 'text-red-900 dark:text-red-100'
    if (daysUntilExpiry <= 7) return 'text-orange-900 dark:text-orange-100'
    return 'text-yellow-900 dark:text-yellow-100'
  }

  const getDescriptionColor = () => {
    if (daysUntilExpiry <= 3) return 'text-red-800 dark:text-red-200'
    if (daysUntilExpiry <= 7) return 'text-orange-800 dark:text-orange-200'
    return 'text-yellow-800 dark:text-yellow-200'
  }

  if (variant === 'card') {
    return (
      <Alert className={getUrgencyColor()}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertCircle className={`h-5 w-5 ${getIconColor()} mt-0.5`} />
            <div className="flex-1">
              <AlertTitle className={getTextColor()}>
                Subscription Expiring Soon
              </AlertTitle>
              <AlertDescription className={getDescriptionColor()}>
                <p className="mb-2">
                  Your subscription will expire in{' '}
                  <span className="font-semibold">
                    {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
                  </span>
                  . Renew now to avoid service interruption.
                </p>
                <ul className="text-sm space-y-1 ml-4 mb-3">
                  <li>• Your events will be hidden from public view</li>
                  <li>• You won&apos;t be able to create new events</li>
                  <li>• Team members will lose access</li>
                </ul>
              </AlertDescription>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <Button onClick={handleRenew} size="sm" className="w-full sm:w-auto">
            Renew Subscription
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Alert>
    )
  }

  // Banner variant
  return (
    <Alert className={getUrgencyColor()}>
      <AlertCircle className={`h-4 w-4 ${getIconColor()}`} />
      <AlertTitle className={getTextColor()}>
        Subscription Expiring in {daysUntilExpiry} Day{daysUntilExpiry !== 1 ? 's' : ''}
      </AlertTitle>
      <AlertDescription className={getDescriptionColor()}>
        <div className="flex items-center justify-between">
          <p>
            Renew your subscription to continue hosting events and managing your team.
          </p>
          <Button
            onClick={handleRenew}
            size="sm"
            variant="default"
            className="ml-4 flex-shrink-0"
          >
            Renew Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
