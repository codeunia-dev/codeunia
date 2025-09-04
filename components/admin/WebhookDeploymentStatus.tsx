"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy,
  RefreshCw,
  Upload,
  Settings
} from 'lucide-react'

interface DeploymentCheck {
  name: string
  status: 'success' | 'warning' | 'error' | 'pending'
  description: string
  action?: string
  actionUrl?: string
}

export function WebhookDeploymentStatus() {
  const [checks, setChecks] = useState<DeploymentCheck[]>([])
  const [loading, setLoading] = useState(true)

  // Environment detection
  const isProduction = process.env.NODE_ENV === 'production'
  const baseUrl = isProduction 
    ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://codeunia.com')
    : 'http://localhost:3000'

  const runDeploymentChecks = useCallback(async () => {
    setLoading(true)
    const newChecks: DeploymentCheck[] = []

    // 1. Environment Check
    newChecks.push({
      name: 'Environment Detection',
      status: 'success',
      description: `Running in ${isProduction ? 'production' : 'development'} mode`,
    })

    // 2. Base URL Check
    newChecks.push({
      name: 'Base URL Configuration',
      status: 'success',
      description: `${isProduction ? 'Production' : 'Development'} URL: ${baseUrl}`,
    })

    // 3. GitHub Webhook URL Check
    try {
      const githubResponse = await fetch(`${baseUrl}/api/webhooks/github`)
      newChecks.push({
        name: 'GitHub Webhook Endpoint',
        status: githubResponse.ok ? 'success' : 'error',
        description: githubResponse.ok 
          ? `Endpoint accessible (${isProduction ? 'production' : 'development'})` 
          : `Failed with status ${githubResponse.status} - ${isProduction ? 'deployment needed' : 'start dev server'}`,
        action: isProduction ? 'Configure in GitHub' : 'Check Dev Server',
        actionUrl: isProduction ? 'https://github.com/codeunia-dev/codeunia/settings/hooks' : undefined
      })
    } catch {
      newChecks.push({
        name: 'GitHub Webhook Endpoint',
        status: 'error',
        description: isProduction 
          ? 'Endpoint not accessible - deployment needed' 
          : 'Development server not running',
        action: isProduction ? 'Check Deployment' : 'Start Dev Server',
      })
    }

    // 4. Razorpay Webhook URL Check
    try {
      const razorpayResponse = await fetch(`${baseUrl}/api/webhooks/razorpay`)
      newChecks.push({
        name: 'Razorpay Webhook Endpoint',
        status: razorpayResponse.ok ? 'success' : 'error',
        description: razorpayResponse.ok 
          ? `Endpoint accessible (${isProduction ? 'production' : 'development'})` 
          : `Failed with status ${razorpayResponse.status} - ${isProduction ? 'deployment needed' : 'start dev server'}`,
        action: isProduction ? 'Configure in Razorpay' : 'Check Dev Server',
        actionUrl: isProduction ? 'https://dashboard.razorpay.com/app/webhooks' : undefined
      })
    } catch {
      newChecks.push({
        name: 'Razorpay Webhook Endpoint',
        status: 'error',
        description: isProduction 
          ? 'Endpoint not accessible - deployment needed' 
          : 'Development server not running',
        action: isProduction ? 'Check Deployment' : 'Start Dev Server',
      })
    }

    // 5. Environment Variables Check (we can't actually check secrets, but we can indicate what's needed)
    newChecks.push({
      name: 'Environment Variables',
      status: 'warning',
      description: 'Ensure WEBHOOK_SECRET and RAZORPAY_WEBHOOK_SECRET are set in production',
      action: 'Check Vercel Dashboard',
      actionUrl: 'https://vercel.com/codeunia-dev/codeunia/settings/environment-variables'
    })

    setChecks(newChecks)
    setLoading(false)
  }, [isProduction, baseUrl])

  useEffect(() => {
    runDeploymentChecks()
  }, [runDeploymentChecks])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusIcon = (status: DeploymentCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: DeploymentCheck['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-600">Success</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-600">Warning</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Upload className="w-5 h-5" />
          Webhook Deployment Status
        </CardTitle>
        <CardDescription>
          Check if webhook endpoints are properly deployed and accessible
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Deployment Checks</h3>
          <Button
            onClick={runDeploymentChecks}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        <div className="space-y-3">
          {checks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <div className="font-medium text-white">{check.name}</div>
                  <div className="text-sm text-gray-400">{check.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(check.status)}
                {check.action && (
                  <Button
                    onClick={() => check.actionUrl && window.open(check.actionUrl, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    {check.actionUrl ? (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {check.action}
                      </>
                    ) : (
                      check.action
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Configuration Guide */}
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            <strong>Configuration Summary ({isProduction ? 'Production' : 'Development'}):</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• GitHub: {isProduction ? 'https://codeunia.com' : baseUrl}/api/webhooks/github</li>
              <li>• Razorpay: {isProduction ? 'https://codeunia.com' : baseUrl}/api/webhooks/razorpay</li>
              <li>• Events: push, pull_request, release (GitHub) | payment.* (Razorpay)</li>
              <li>• Secrets: WEBHOOK_SECRET & RAZORPAY_WEBHOOK_SECRET</li>
              {!isProduction && <li>• Note: External services should use production URLs</li>}
            </ul>
          </AlertDescription>
        </Alert>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => copyToClipboard('https://codeunia.com/api/webhooks/github')}
            variant="outline"
            size="sm"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy GitHub URL
          </Button>
          <Button
            onClick={() => copyToClipboard('https://codeunia.com/api/webhooks/razorpay')}
            variant="outline"
            size="sm"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Razorpay URL
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
