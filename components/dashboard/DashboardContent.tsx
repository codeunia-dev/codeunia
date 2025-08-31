'use client'

import React from 'react'
import { Sparkles, Rocket, Shield, User } from 'lucide-react'
import { ContributionGraph } from '@/components/ui/contribution-graph'
import { useContributionGraph } from '@/hooks/useContributionGraph'
import MembershipCard from '@/components/MembershipCard'
import { ClientOnly } from '@/components/ClientOnly'

interface DashboardContentProps {
  userId: string
  displayName: string
}

export function DashboardContent({ userId, displayName }: DashboardContentProps) {
  const {
    data: activityData,
    loading: activityLoading,
    handleFilterChange,
    refresh: refreshActivity
  } = useContributionGraph()

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <User className="h-8 w-8 text-white" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
            Welcome back, {displayName}!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
            Ready to explore Codeunia
          </p>
        </div>
      </div>

      {/* Membership Card Section */}
      <ClientOnly fallback={<div className="flex justify-center my-8 h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />}>
        <div className="flex justify-center my-8">
          <MembershipCard uid={userId} />
        </div>
      </ClientOnly>

      {/* Contribution Graph Section */}
      <ClientOnly fallback={<div className="mt-8 h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />}>
        <div className="mt-8">
          <ContributionGraph
            data={activityData}
            loading={activityLoading}
            onFilterChange={handleFilterChange}
            onRefresh={refreshActivity}
            className="w-full"
          />
        </div>
      </ClientOnly>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 border border-yellow-200 dark:border-yellow-700/50 p-6 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl">
              <Rocket className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                  Something Big is Coming
                </h3>
                <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
              </div>
              <p className="text-yellow-700 dark:text-yellow-300 leading-relaxed">
                Our user panel is under active development. We&apos;re crafting an amazing experience just for you.
                <span className="font-semibold"> Stay tuned for exciting updates!</span>
              </p>
              <div className="flex items-center gap-2 pt-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
                <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                  Development in progress
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Secure Dashboard</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Advanced security features and personalized dashboard coming soon.</p>
        </div>

        <div className="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Features</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered tools and intelligent recommendations tailored for you.</p>
        </div>

        <div className="group p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all duration-300">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Rocket className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Performance</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Lightning-fast performance with real-time updates and analytics.</p>
        </div>
      </div>
    </div>
  )
} 