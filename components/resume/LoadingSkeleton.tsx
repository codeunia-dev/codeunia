'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ResumeEditorSkeleton() {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Resume Title Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
      </div>

      {/* Section Skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}

      {/* Add Section Button Skeleton */}
      <Skeleton className="h-10 w-40" />
    </div>
  );
}

export function ResumePreviewSkeleton() {
  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* Preview Toolbar Skeleton */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>

      {/* Preview Content Skeleton */}
      <div className="flex-1 overflow-auto p-8 flex justify-center">
        <div className="bg-white shadow-2xl w-[8.5in] min-h-[11in] p-12 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-56" />
          </div>

          {/* Sections */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ResumeListSkeleton() {
  return (
    <div className="h-full flex flex-col">
      {/* Header Skeleton */}
      <div className="p-4 border-b space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>

      {/* List Items Skeleton */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function FullPageLoadingSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Toolbar Skeleton */}
      <div className="border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-6 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Skeleton */}
        <div className="w-80 border-r p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-9 w-full" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>

        {/* Editor Skeleton */}
        <div className="w-[40%] min-w-[400px] max-w-[600px]">
          <ResumeEditorSkeleton />
        </div>

        {/* Preview Skeleton */}
        <div className="flex-1">
          <ResumePreviewSkeleton />
        </div>
      </div>
    </div>
  );
}
