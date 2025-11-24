"use client"

import React from "react";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/header";

// Lazy load non-critical components
const HeroSection2 = dynamic(() => import("@/components/home/HeroSection2").then(mod => ({ default: mod.HeroSection2 })), {
  loading: () => (
    <div className="min-h-[600px] flex items-center justify-center">
      <div className="animate-pulse text-primary">Loading...</div>
    </div>
  ),
  ssr: true
});

const FeaturesSection = dynamic(() => import("@/components/home/FeaturesSection").then(mod => ({ default: mod.FeaturesSection })), {
  loading: () => (
    <div className="py-24">
      <div className="container px-4 mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  ),
  ssr: false
});

const CommunitySpotlight = dynamic(() => import("@/components/home/CommunitySpotlight").then(mod => ({ default: mod.CommunitySpotlight })), {
  loading: () => (
    <div className="py-16">
      <div className="container px-4 mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  ),
  ssr: false
});

const LatestContentPreview = dynamic(() => import("@/components/home/LatestContentPreview").then(mod => ({ default: mod.LatestContentPreview })), {
  loading: () => (
    <div className="py-24">
      <div className="container px-4 mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  ),
  ssr: false
});

// New: SponsorsSection on Home
const SponsorsSection = dynamic(() => import("@/components/home/SponsorsSection").then(mod => ({ default: mod.SponsorsSection })), {
  loading: () => (
    <div className="py-16">
      <div className="container px-4 mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  ),
  ssr: false
});

// New: OrganizationsSection for company hosting
const OrganizationsSection = dynamic(() => import("@/components/home/OrganizationsSection").then(mod => ({ default: mod.OrganizationsSection })), {
  loading: () => (
    <div className="py-20">
      <div className="container px-4 mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  ),
  ssr: false
});

const Footer = dynamic(() => import("@/components/footer"), {
  loading: () => (
    <footer className="border-t border-border/40 bg-gradient-to-b from-background/95 via-background to-background/95">
      <div className="container px-4 py-16">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </footer>
  ),
  ssr: true
});

export default function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between">
        <Header />
        <div className="w-full max-w-[2000px]">
          <Suspense fallback={<div className="min-h-[600px] flex items-center justify-center"><div className="animate-pulse text-primary">Loading...</div></div>}>
            <HeroSection2 />
          </Suspense>

          <Suspense fallback={<div className="py-24"><div className="container px-4 mx-auto"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div><div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div></div></div></div>}>
            <FeaturesSection />
          </Suspense>

          {/* New: Organizations Section for company hosting */}
          <Suspense fallback={<div className="py-20"><div className="container px-4 mx-auto"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div><div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div></div></div></div>}>
            <OrganizationsSection />
          </Suspense>

          <Suspense fallback={<div className="py-16"><div className="container px-4 mx-auto"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div><div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div></div></div></div>}>
            <CommunitySpotlight />
          </Suspense>

          {/* New: Sponsors Section on Home */}
          <Suspense fallback={<div className="py-16"><div className="container px-4 mx-auto"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div><div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div></div></div></div>}>
            <SponsorsSection />
          </Suspense>

          <Suspense fallback={<div className="py-24"><div className="container px-4 mx-auto"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div><div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div></div></div></div>}>
            <LatestContentPreview />
          </Suspense>
        </div>
        <Footer />
      </main>
    </>
  )
}
