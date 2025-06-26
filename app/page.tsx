"use client"

import React, { useState } from "react";
import Header from "@/components/header";
import { StickyBanner } from "@/components/ui/sticky-banner";
import { HeroSection2 } from "@/components/home/HeroSection2"
import { FeaturesSection } from "@/components/home/FeaturesSection"
import { CommunitySpotlight } from "@/components/home/CommunitySpotlight"
import { LatestContentPreview } from "@/components/home/LatestContentPreview"
import Footer from "@/components/footer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Home() {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); }}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Special Announcement!</DialogTitle>
            <DialogDescription>
              <div className="flex flex-col items-center gap-4">
                <img src="/images/colab/orbo.jpeg" alt="Orbo AI Collaboration" className="rounded-lg w-full max-w-xs object-cover" />
                <div className="text-base text-center">
                  <b>We are thrilled to announce a special collaboration with Orbo AI!</b><br/>
                  Manoj, co-founder of Orbo AI (as seen on Shark Tank India), will be joining RealityCode for an exclusive online session and fireside chat. Gain unique insights into startup journeys and co-founder alignment, straight from the innovators themselves!<br/><br/>
                  Stay tuned for more details. We are excited to support the next generation of innovators with Orbo AI!
                </div>
                <a
                  href="https://unstop.com/p/realitycode-by-codeunia-codeunia-1488383"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded shadow transition-colors duration-200"
                >
                  Register Now
                </a>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <main className="flex min-h-screen flex-col items-center justify-between">
        <Header/>
        <StickyBanner className="sticky top-16 bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900 font-medium shadow-md">
          <span className="mr-2">🚧</span>
          This site is under active development. Features and content may change!
        </StickyBanner>
        <div className="w-full max-w-[2000px]">
          <HeroSection2 />
          <FeaturesSection />
          <CommunitySpotlight />
          <LatestContentPreview />
        </div>
        <Footer/>
      </main>
    </>
  )
}