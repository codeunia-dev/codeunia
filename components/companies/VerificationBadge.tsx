import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface VerificationBadgeProps {
  status: 'pending' | 'verified' | 'rejected'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const statusConfig = {
  verified: {
    icon: CheckCircle2,
    label: 'Verified',
    variant: 'default' as const,
    className: 'bg-green-500 hover:bg-green-600 text-white border-green-600',
    tooltip: 'This company has been verified by Codeunia',
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    variant: 'secondary' as const,
    className: 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600',
    tooltip: 'Verification is pending review',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    variant: 'destructive' as const,
    className: 'bg-red-500 hover:bg-red-600 text-white border-red-600',
    tooltip: 'Verification was rejected',
  },
}

const sizeClasses = {
  sm: {
    badge: 'text-xs px-1.5 py-0.5',
    icon: 'h-3 w-3',
  },
  md: {
    badge: 'text-xs px-2 py-0.5',
    icon: 'h-3.5 w-3.5',
  },
  lg: {
    badge: 'text-sm px-2.5 py-1',
    icon: 'h-4 w-4',
  },
}

export function VerificationBadge({
  status,
  size = 'md',
  showLabel = false,
  className
}: VerificationBadgeProps) {
  const config = statusConfig[status]
  const sizes = sizeClasses[size]
  const Icon = config.icon

  const badge = (
    <Badge
      variant={config.variant}
      className={cn(
        sizes.badge,
        config.className,
        "inline-flex items-center gap-1 font-medium",
        className
      )}
    >
      <Icon className={sizes.icon} />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
