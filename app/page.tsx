"use client"

import React, { useState } from "react";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import Image from 'next/image';
import Header from "@/components/header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {/* 🎉 Happy Birthday Dialog 🎉 */}
{/* 🎉 Happy Birthday Dialog 🎉 */}
<Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); }}>
  <DialogContent showCloseButton>
    <DialogHeader>
      <DialogTitle className="text-center text-2xl font-bold text-blue-600">
        🎂 Happy Birthday to Our Founder! 🎉
      </DialogTitle>
      <DialogDescription asChild>
        <div className="flex flex-col items-center gap-4">
          <Image 
            src="/images/birthday.jpeg" 
            alt="Happy Birthday" 
            width={300}
            height={200}
            className="rounded-lg w-full max-w-xs object-cover shadow-lg"
          />
          <div className="text-base text-center text-muted-foreground">
            Today, we celebrate the vision, passion, and dedication of our amazing founder.  
            <br/><br/>
            <b className="text-blue-700">
              Wishing you a wonderful year ahead filled with success, happiness, and endless possibilities. 💙
            </b>
          </div>
          <div className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded shadow transition-colors duration-200">
            🎉 Happy Birthday from the entire Codeunia family!
          </div>
        </div>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>

      <main className="flex min-h-screen flex-col items-center justify-between">
        <Header/>
        <div className="w-full max-w-[2000px]">
          <Suspense fallback={<div className="min-h-[600px] flex items-center justify-center"><div className="animate-pulse text-primary">Loading...</div></div>}>
            <HeroSection2 />
          </Suspense>

          <Suspense fallback={<div className="py-24"><div className="container px-4 mx-auto"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div><div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div></div></div></div>}>
            <FeaturesSection />
          </Suspense>

          <Suspense fallback={<div className="py-16"><div className="container px-4 mx-auto"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div><div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div></div></div></div>}>
            <CommunitySpotlight />
          </Suspense>

          <Suspense fallback={<div className="py-24"><div className="container px-4 mx-auto"><div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div><div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div></div></div></div>}>
            <LatestContentPreview />
          </Suspense>
        </div>
        <Footer/>
      </main>
    </>
  )
}
