'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search, Users, UserPlus } from 'lucide-react'
import { FollowingList } from '@/components/connections/FollowingList'
import { FollowersList } from '@/components/connections/FollowersList'
import { SearchUsers } from '@/components/connections/SearchUsers'
import { ConnectionStats } from '@/components/connections/ConnectionStats'

export default function ConnectionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('following')

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-black">
      {/* Header */}
      <div className="border-b p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold">Connections</h1>
          </div>
          <ConnectionStats onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex flex-col p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="following" className="gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Following</span>
              </TabsTrigger>
              <TabsTrigger value="followers" className="gap-2">
                <Users className="h-4 w-4" />
                <span>Followers</span>
              </TabsTrigger>
              <TabsTrigger value="search" className="gap-2">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="following" className="flex-1 overflow-y-auto space-y-3">
              <FollowingList />
            </TabsContent>

            <TabsContent value="followers" className="flex-1 overflow-y-auto space-y-3">
              <FollowersList />
            </TabsContent>

            <TabsContent value="search" className="flex-1 overflow-y-auto space-y-3">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
              <SearchUsers searchQuery={searchQuery} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
