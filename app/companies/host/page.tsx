import Header from "@/components/header"
import Footer from "@/components/footer"
import { HostingHero } from "@/components/companies/HostingHero"
import { CompanyStats } from "@/components/companies/CompanyStats"
import { HowItWorksSection } from "@/components/companies/HowItWorksSection"
import { CompanyFeatures } from "@/components/companies/CompanyFeatures"
import { CompanyFAQ } from "@/components/companies/CompanyFAQ"
import { CompanyCTA } from "@/components/companies/CompanyCTA"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Host Tech Events & Hackathons | Codeunia for Companies",
    description: "Host verified events, hackathons, and workshops on Codeunia. Engage 3000+ developers with team collaboration, analytics, and professional event management tools.",
    keywords: "host tech events, developer hackathons, workshop hosting, event management platform, tech community engagement",
    openGraph: {
        title: "Host Tech Events & Hackathons | Codeunia for Companies",
        description: "Host verified events, hackathons, and workshops on Codeunia. Engage 3000+ developers with team collaboration, analytics, and professional event management tools.",
        type: "website",
    },
}

export default function CompanyHostingPage() {
    return (
        <div className="flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/10">
            <Header />

            <main className="flex-1">
                <HostingHero />
                <CompanyStats />
                <HowItWorksSection />
                <CompanyFeatures />
                <CompanyFAQ />
                <CompanyCTA />
            </main>

            <Footer />
        </div>
    )
}
