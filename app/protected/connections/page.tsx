'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search, Users } from 'lucide-react'
import { FollowingList } from '@/components/connections/FollowingList'
import { FollowersList } from '@/components/connections/FollowersList'
import { SearchUsers } from '@/components/connections/SearchUsers'
import { ConnectionStats } from '@/components/connections/ConnectionStats'

export default function ConnectionsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-black">
      {/* Header */}
      <div className="border-b p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold">Connections</h1>
          </div>
          <ConnectionStats />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex flex-col p-4">
          <Tabs defaultValue="following" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="following">Following</TabsTrigger>
              <TabsTrigger value="followers">Followers</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
            </TabsList>

            <TabsContent value="following" className="flex-1 overflow-y-auto space-y-3">
              <FollowingList />
            </TabsContent>

            <TabsContent value="followers" className="flex-1 overflow-y-auto space-y-3">
              <FollowersList />
            </TabsContent>

            <TabsContent value="search" className="flex-1 overflow-y-auto space-y-3">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for users to connect..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <SearchUsers searchQuery={searchQuery} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
