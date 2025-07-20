"use client"

import React from "react";
import Header from "@/components/header";
import { HeroSection2 } from "@/components/home/HeroSection2"
import { FeaturesSection } from "@/components/home/FeaturesSection"
import { CommunitySpotlight } from "@/components/home/CommunitySpotlight"
import { LatestContentPreview } from "@/components/home/LatestContentPreview"
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between">
        <Header/>
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