"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Trash2, 
  RefreshCw, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Info
} from 'lucide-react'

interface CacheStatus {
  cloudflareConfigured: boolean
  environment: string
  lastPurge: string
  buildId: string
}

interface PurgeResult {
  success: boolean
  message: string
}

export function CacheManagementDashboard() {
  const [status, setStatus] = useState<CacheStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [purging, setPurging] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<PurgeResult | null>(null)

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/cache-management')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch cache status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurge = async (type: 'all' | 'events' | 'pages') => {
    setPurging(type)
    setLastResult(null)
    
    try {
      const response = await fetch('/api/admin/cache-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purge', type }),
      })
      
      const result = await response.json()
      setLastResult(result)
      
      // Refresh status after purge
      await fetchStatus()
    } catch (error) {
      setLastResult({
        success: false,
        message: `Failed to purge cache: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setPurging(null)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading Cache Management...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Zap className="w-5 h-5" />
            Cache Management System
          </CardTitle>
          <CardDescription>
            Cloudflare CDN + Application-level caching with automatic purging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Cloudflare Status</p>
                <Badge variant={status.cloudflareConfigured ? "default" : "destructive"}>
                  {status.cloudflareConfigured ? "Configured" : "Not Configured"}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Environment</p>
                <Badge variant="outline">{status.environment}</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Last Purge</p>
                <p className="text-sm font-mono">{
                  status.lastPurge === 'Never' ? 'Never' : 
                  new Date(status.lastPurge).toLocaleString()
                }</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Build ID</p>
                <p className="text-sm font-mono">{status.buildId.substring(0, 8)}...</p>
              </div>
            </div>
          )}
          
          {!status?.cloudflareConfigured && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Cloudflare is not configured. Set CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN environment variables.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Cache Purge Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Manual Cache Purge</CardTitle>
          <CardDescription>
            Purge specific types of cached content. Use with caution in production.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-white">Events & Hackathons</h4>
              <p className="text-sm text-gray-400">
                Purge event and hackathon pages and API responses
              </p>
              <Button
                onClick={() => handlePurge('events')}
                disabled={purging === 'events'}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {purging === 'events' ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Purge Events
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-white">Pages Only</h4>
              <p className="text-sm text-gray-400">
                Purge page content while keeping API responses cached
              </p>
              <Button
                onClick={() => handlePurge('pages')}
                disabled={purging === 'pages'}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {purging === 'pages' ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Purge Pages
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-white">Everything</h4>
              <p className="text-sm text-gray-400">
                Purge all cached content (use only for major updates)
              </p>
              <Button
                onClick={() => handlePurge('all')}
                disabled={purging === 'all'}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                {purging === 'all' ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Purge All
              </Button>
            </div>
          </div>

          {lastResult && (
            <Alert className={lastResult.success ? "border-green-500" : "border-red-500"}>
              {lastResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription className={lastResult.success ? "text-green-700" : "text-red-700"}>
                {lastResult.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Cache Strategy Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Info className="w-5 h-5" />
            Active Cache Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium text-white">Static Assets</h4>
                <p className="text-sm text-gray-400">CSS, JS, Images: 1 year cache with immutable headers</p>
                <Badge variant="secondary">Max Performance</Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-white">Events/Hackathons</h4>
                <p className="text-sm text-gray-400">1min CDN + 5min stale-while-revalidate</p>
                <Badge variant="secondary">Fast Updates</Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-white">API Responses</h4>
                <p className="text-sm text-gray-400">30s CDN + 2min stale-while-revalidate</p>
                <Badge variant="secondary">Real-time Feel</Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-white">User Pages</h4>
                <p className="text-sm text-gray-400">No cache for authenticated content</p>
                <Badge variant="secondary">Private Data</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automatic Purging Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Clock className="w-5 h-5" />
            Automatic Cache Purging
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-sm">New Deployment</span>
              <Badge variant="outline">Auto Purge</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-sm">Event/Hackathon Created</span>
              <Badge variant="outline">Auto Purge</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-sm">Content Updated</span>
              <Badge variant="outline">Auto Purge</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Database Changes</span>
              <Badge variant="outline">Auto Purge</Badge>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded">
            <p className="text-sm text-blue-200">
              <strong>Webhook URL:</strong> {process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/cache-purge
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
