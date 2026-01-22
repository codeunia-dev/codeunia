"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/header";
import { WhatIsOpenSource } from "@/components/WhatIsOpenSource";
import { OpenSourceSteps } from "@/components/open-source/OpenSourceSteps";
import { OpenSourceFAQ } from "@/components/open-source/OpenSourceFAQ";
import { OpenSourceHero } from "@/components/open-source/OpenSourceHero";
import { SwagShowcase } from "@/components/open-source/SwagShowcase";

const Footer = dynamic(() => import("@/components/footer"), {
    ssr: true
});

export default function OpenSourcePage() {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="flex-1 mt-16">
                {/* We can reuse the WhatIsOpenSource component here. 
            Since it's a dedicated page, we might want to add a hero section or breadcrumbs later, 
            but the current component is designed as a full section so it works well. */}
                <OpenSourceHero />
                <SwagShowcase />
                <WhatIsOpenSource />
                <OpenSourceSteps />
                <OpenSourceFAQ />
            </div>

            <Footer />
        </main>
    );
}
