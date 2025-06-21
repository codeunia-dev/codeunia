"use client"

import Header from "@/components/header";
import { StickyBanner } from "@/components/ui/sticky-banner";
import { HeroSection2 } from "@/components/home/HeroSection2"
import { FeaturesSection } from "@/components/home/FeaturesSection"
import { CommunitySpotlight } from "@/components/home/CommunitySpotlight"
import { LatestContentPreview } from "@/components/home/LatestContentPreview"
import Footer from "@/components/footer";

export default function Home() {
  return (
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
  )
}