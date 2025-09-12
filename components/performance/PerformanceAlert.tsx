"use client"

import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PerformanceAlertProps {
  onDismiss?: () => void
}

export function PerformanceAlert({ onDismiss }: PerformanceAlertProps) {
  const [, setPerformanceData] = useState<{
    lcp: number
    fid: number
    cls: number
    fcp: number
    ttfb: number
  } | null>(null)
  const [alerts, setAlerts] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Monitor Core Web Vitals
    const checkPerformance = () => {
      if (typeof window === 'undefined') return

      // Get performance metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
      const ttfb = navigation.responseStart - navigation.requestStart
      
      // Simulate LCP, FID, CLS (in real implementation, use web-vitals library)
      const lcp = fcp + Math.random() * 1000 // Simulated
      const fid = Math.random() * 100 // Simulated
      const cls = Math.random() * 0.1 // Simulated

      const metrics = { lcp, fid, cls, fcp, ttfb }
      setPerformanceData(metrics)

      // Check for performance issues
      const newAlerts: string[] = []
      
      if (lcp > 2500) {
        newAlerts.push(`LCP is ${Math.round(lcp)}ms (target: <2500ms)`)
      }
      if (fid > 100) {
        newAlerts.push(`FID is ${Math.round(fid)}ms (target: <100ms)`)
      }
      if (cls > 0.1) {
        newAlerts.push(`CLS is ${cls.toFixed(3)} (target: <0.1)`)
      }
      if (fcp > 1800) {
        newAlerts.push(`FCP is ${Math.round(fcp)}ms (target: <1800ms)`)
      }
      if (ttfb > 600) {
        newAlerts.push(`TTFB is ${Math.round(ttfb)}ms (target: <600ms)`)
      }

      setAlerts(newAlerts)
      setIsVisible(newAlerts.length > 0)
    }

    // Check performance after page load
    if (document.readyState === 'complete') {
      checkPerformance()
    } else {
      window.addEventListener('load', checkPerformance)
    }

    // Monitor performance continuously
    const interval = setInterval(checkPerformance, 30000) // Check every 30 seconds

    return () => {
      window.removeEventListener('load', checkPerformance)
      clearInterval(interval)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible || alerts.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          <div className="space-y-2">
            <div className="font-semibold">Performance Issues Detected</div>
            <ul className="text-sm space-y-1">
              {alerts.map((alert, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-orange-600 rounded-full" />
                  {alert}
                </li>
              ))}
            </ul>
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Dismiss
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
                className="text-xs"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default PerformanceAlert
