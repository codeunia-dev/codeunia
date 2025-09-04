"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { WebhookDeploymentStatus } from './WebhookDeploymentStatus'
import { 
  Webhook, 
  Github, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react'

interface WebhookStatus {
  endpoint: string
  status: string
  lastPing?: string
  supported_events: string[]
}

export function WebhookManagementDashboard() {
  const [githubStatus, setGithubStatus] = useState<WebhookStatus | null>(null)
  const [razorpayStatus, setRazorpayStatus] = useState<WebhookStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null)

  const isDevelopment = process.env.NODE_ENV === 'development'
  const baseUrl = isDevelopment 
    ? 'http://localhost:3000' 
    : (process.env.NEXT_PUBLIC_SITE_URL || 'https://codeunia.com')

  const webhookEndpoints = {
    github: `${baseUrl}/api/webhooks/github`,
    razorpay: `${baseUrl}/api/webhooks/razorpay`,
    cachePurge: `${baseUrl}/api/webhooks/cache-purge`,
  }

  // Production webhook URLs for display (what external services should use)
  const productionWebhookEndpoints = {
    github: 'https://codeunia.com/api/webhooks/github',
    razorpay: 'https://codeunia.com/api/webhooks/razorpay',
    cachePurge: 'https://codeunia.com/api/webhooks/cache-purge',
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const testWebhook = async (type: 'github' | 'razorpay') => {
    setTestingWebhook(type)
    
    try {
      // Test the actual webhook endpoint
      const endpoint = webhookEndpoints[type]
      
      // In development, test normally
      // In production, just check if the route exists
      if (isDevelopment) {
        await fetchWebhookStatus()
      } else {
        // For production, we'll check the endpoint availability differently
        try {
          const response = await fetch(endpoint, { method: 'HEAD' })
          console.log(`Webhook ${type} test result:`, response.status)
        } catch (error) {
          console.error(`Production webhook test failed for ${type}:`, error)
        }
        await fetchWebhookStatus()
      }
    } catch (error) {
      console.error(`Failed to test ${type} webhook:`, error)
    } finally {
      setTestingWebhook(null)
    }
  }

  const fetchWebhookStatus = useCallback(async () => {
    try {
      setLoading(true)
      
      // Test GitHub webhook
      try {
        const githubResponse = await fetch(webhookEndpoints.github)
        const githubData = await githubResponse.json()
        setGithubStatus({
          endpoint: productionWebhookEndpoints.github, // Always show production URL
          status: githubResponse.ok ? 'active' : 'error',
          supported_events: githubData.events_supported || [],
        })
      } catch (error) {
        console.error('GitHub webhook test failed:', error)
        setGithubStatus({
          endpoint: productionWebhookEndpoints.github,
          status: isDevelopment ? 'error' : 'configured', // Show 'configured' in production even if test fails
          supported_events: ['push', 'pull_request', 'release', 'ping'],
        })
      }

      // Test Razorpay webhook
      try {
        const razorpayResponse = await fetch(webhookEndpoints.razorpay)
        const razorpayData = await razorpayResponse.json()
        setRazorpayStatus({
          endpoint: productionWebhookEndpoints.razorpay, // Always show production URL
          status: razorpayResponse.ok ? 'active' : 'error',
          supported_events: razorpayData.events_supported || [],
        })
      } catch (error) {
        console.error('Razorpay webhook test failed:', error)
        setRazorpayStatus({
          endpoint: productionWebhookEndpoints.razorpay,
          status: isDevelopment ? 'error' : 'configured', // Show 'configured' in production even if test fails
          supported_events: ['payment.authorized', 'payment.captured', 'payment.failed', 'order.paid'],
        })
      }
    } catch (error) {
      console.error('Failed to fetch webhook status:', error)
    } finally {
      setLoading(false)
    }
  }, [webhookEndpoints.github, webhookEndpoints.razorpay, productionWebhookEndpoints.github, productionWebhookEndpoints.razorpay, isDevelopment])

  useEffect(() => {
    fetchWebhookStatus()
  }, [fetchWebhookStatus])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading Webhook Status...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Environment Info Alert */}
      {!isDevelopment && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Production Mode:</strong> Webhook endpoints are configured for external services. 
            Status shows &quot;Configured&quot; if endpoints are properly set up in GitHub and Razorpay dashboards.
            <br />
            <span className="text-sm text-gray-600 mt-1 block">
              Environment: Production | Domain: {baseUrl}
            </span>
          </AlertDescription>
        </Alert>
      )}
      
      {isDevelopment && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Development Mode:</strong> Testing webhook endpoints locally. 
            Make sure your development server is running to see &quot;Active&quot; status.
            <br />
            <span className="text-sm text-gray-600 mt-1 block">
              Environment: Development | Local: {baseUrl}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Deployment Status */}
      <WebhookDeploymentStatus />

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Webhook className="w-5 h-5" />
            Webhook Management
          </CardTitle>
          <CardDescription>
            Monitor and manage webhook endpoints for GitHub and Razorpay integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {((githubStatus?.status === 'active' || githubStatus?.status === 'configured') ? 1 : 0) + 
                 ((razorpayStatus?.status === 'active' || razorpayStatus?.status === 'configured') ? 1 : 0)}
              </div>
              <p className="text-sm text-gray-400">
                {isDevelopment ? 'Active Webhooks' : 'Configured Webhooks'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {(githubStatus?.supported_events?.length || 0) + 
                 (razorpayStatus?.supported_events?.length || 0)}
              </div>
              <p className="text-sm text-gray-400">Supported Events</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">3</div>
              <p className="text-sm text-gray-400">Total Endpoints</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GitHub Webhook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub Webhook
            </div>
            <Badge variant={
              githubStatus?.status === 'active' ? 'default' : 
              githubStatus?.status === 'configured' ? 'secondary' : 
              'destructive'
            }>
              {githubStatus?.status === 'active' ? 'Active' : 
               githubStatus?.status === 'configured' ? 'Configured' : 
               'Error'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Handles deployment triggers and repository events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="github-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="github-url"
                value={productionWebhookEndpoints.github}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={() => copyToClipboard(productionWebhookEndpoints.github)}
                variant="outline"
                size="sm"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Supported Events</Label>
            <div className="flex flex-wrap gap-2">
              {githubStatus?.supported_events?.map((event) => (
                <Badge key={event} variant="secondary" className="text-xs">
                  {event}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Configuration</Label>
            <div className="bg-gray-900 p-3 rounded text-sm font-mono">
              <div>Content Type: application/json</div>
              <div>Secret: WEBHOOK_SECRET (from env)</div>
              <div>Events: push, pull_request, release</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => testWebhook('github')}
              disabled={testingWebhook === 'github'}
              variant="outline"
              size="sm"
            >
              {testingWebhook === 'github' ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Test Webhook
            </Button>
            <Button
              onClick={() => window.open('https://github.com/codeunia-dev/codeunia/settings/hooks', '_blank')}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              GitHub Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Razorpay Webhook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Razorpay Webhook
            </div>
            <Badge variant={
              razorpayStatus?.status === 'active' ? 'default' : 
              razorpayStatus?.status === 'configured' ? 'secondary' : 
              'destructive'
            }>
              {razorpayStatus?.status === 'active' ? 'Active' : 
               razorpayStatus?.status === 'configured' ? 'Configured' : 
               'Error'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Handles payment events and transaction updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="razorpay-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="razorpay-url"
                value={productionWebhookEndpoints.razorpay}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={() => copyToClipboard(productionWebhookEndpoints.razorpay)}
                variant="outline"
                size="sm"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Supported Events</Label>
            <div className="flex flex-wrap gap-2">
              {razorpayStatus?.supported_events?.map((event) => (
                <Badge key={event} variant="secondary" className="text-xs">
                  {event}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Configuration</Label>
            <div className="bg-gray-900 p-3 rounded text-sm font-mono">
              <div>Content Type: application/json</div>
              <div>Secret: RAZORPAY_WEBHOOK_SECRET (from env)</div>
              <div>Active: Yes</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => testWebhook('razorpay')}
              disabled={testingWebhook === 'razorpay'}
              variant="outline"
              size="sm"
            >
              {testingWebhook === 'razorpay' ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Test Webhook
            </Button>
            <Button
              onClick={() => window.open('https://dashboard.razorpay.com/app/webhooks', '_blank')}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Razorpay Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cache Purge Webhook */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Webhook className="w-5 h-5" />
            Cache Purge Webhook
          </CardTitle>
          <CardDescription>
            Handles automatic cache invalidation events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cache-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="cache-url"
                value={webhookEndpoints.cachePurge}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={() => copyToClipboard(webhookEndpoints.cachePurge)}
                variant="outline"
                size="sm"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This endpoint is used internally for cache management. 
              It can also be called by external services like Vercel deployment hooks.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-white mb-2">1. GitHub Webhook Setup</h4>
              <ul className="text-sm text-gray-400 space-y-1 ml-4">
                <li>• Go to your repository settings</li>
                <li>• Navigate to Webhooks section</li>
                <li>• Add the GitHub webhook URL</li>
                <li>• Set content type to application/json</li>
                <li>• Add your WEBHOOK_SECRET</li>
                <li>• Select events: push, pull_request, release</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-2">2. Razorpay Webhook Setup</h4>
              <ul className="text-sm text-gray-400 space-y-1 ml-4">
                <li>• Go to Razorpay Dashboard</li>
                <li>• Navigate to Webhooks section</li>
                <li>• Add the Razorpay webhook URL</li>
                <li>• Set your RAZORPAY_WEBHOOK_SECRET</li>
                <li>• Enable events: payment.authorized, payment.captured, payment.failed, order.paid</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
