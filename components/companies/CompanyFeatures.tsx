"use client"

import { motion } from "framer-motion"
import { Building2, Users, BarChart3, Shield, FileText, Sparkles } from "lucide-react"
import { CardSpotlight } from "@/components/ui/card-spotlight"
import { cn } from "@/lib/utils"

const features = [
    {
        icon: Building2,
        title: "Verified Company Profiles",
        description: "Build credibility with verified badges and professional company pages. Showcase your logo, description, and social links with custom branding.",
        benefits: [
            "Professional company pages with custom branding",
            "Verified badge for credibility",
            "Industry and company size categorization",
        ],
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        icon: Sparkles,
        title: "Event & Hackathon Management",
        description: "Create unlimited events and hackathons with rich descriptions, image uploads, and built-in registration management.",
        benefits: [
            "Unlimited events and hackathons",
            "Rich text editor with image uploads",
            "Registration and participant tracking",
        ],
        gradient: "from-purple-500 to-pink-500",
    },
    {
        icon: Users,
        title: "Team Collaboration",
        description: "Invite unlimited team members with role-based permissions. Collaborate on event creation with owners, admins, editors, and viewers.",
        benefits: [
            "Invite unlimited team members",
            "Role-based permissions (Owner, Admin, Editor, Viewer)",
            "Activity tracking and audit logs",
        ],
        gradient: "from-green-500 to-emerald-500",
    },
    {
        icon: BarChart3,
        title: "Analytics & Insights",
        description: "Track event performance with real-time metrics. Monitor registrations, attendance, and engagement with exportable reports.",
        benefits: [
            "Real-time event performance metrics",
            "Registration and attendance tracking",
            "Export reports as CSV",
        ],
        gradient: "from-orange-500 to-red-500",
    },
    {
        icon: FileText,
        title: "Document Management",
        description: "Securely upload verification documents with virus scanning and validation. Private storage with signed URLs for secure access.",
        benefits: [
            "Secure document uploads for verification",
            "Virus scanning and validation",
            "Private document storage with signed URLs",
        ],
        gradient: "from-indigo-500 to-purple-500",
    },
    {
        icon: Shield,
        title: "Brand Visibility",
        description: "Get featured on the company directory and event listings. Benefit from search engine optimized pages and social media integration.",
        benefits: [
            "Featured on company directory",
            "Event listings on homepage",
            "SEO-optimized pages",
        ],
        gradient: "from-pink-500 to-rose-500",
    },
]

export function CompanyFeatures() {
    return (
        <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent"></div>

            <div className="container px-4 mx-auto relative z-10">
                <motion.div
                    className="text-center space-y-6 mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <div className="flex flex-col items-center justify-center gap-4">
                        <button className="bg-slate-800 no-underline group relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block cursor-default">
                            <span className="absolute inset-0 overflow-hidden rounded-full">
                                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            </span>
                            <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                                <span>Powerful Features</span>
                            </div>
                            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                        </button>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                        Everything You Need to{" "}
                        <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                            Host Successful Events
                        </span>
                    </h2>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Comprehensive tools for event management, team collaboration, and analytics
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8, transition: { duration: 0.3 } }}
                        >
                            <CardSpotlight
                                className="relative h-full bg-white/50 dark:bg-background/50 backdrop-blur-md border border-primary/10 overflow-hidden"
                                color="rgba(99, 102, 241, 0.15)"
                            >
                                <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.7)_0%,_rgba(255,255,255,0)_60%)] dark:bg-none" />

                                <div className="relative z-10 space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <motion.div
                                            className={cn(
                                                "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden",
                                                `bg-gradient-to-br ${feature.gradient}`
                                            )}
                                            whileHover={{
                                                rotate: [0, -10, 10, 0],
                                                transition: { duration: 0.5 },
                                            }}
                                        >
                                            <feature.icon className="h-8 w-8 text-white relative z-10" />
                                            <motion.div
                                                className="absolute inset-0 bg-white/20"
                                                initial={{ scale: 0, opacity: 0 }}
                                                whileHover={{
                                                    scale: 1,
                                                    opacity: 1,
                                                    transition: { duration: 0.3 },
                                                }}
                                            />
                                        </motion.div>
                                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                            {feature.title}
                                        </h3>
                                    </div>

                                    <p className="text-zinc-800 dark:text-foreground/80 leading-relaxed">
                                        {feature.description}
                                    </p>

                                    <ul className="space-y-2">
                                        {feature.benefits.map((benefit, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <span className="text-primary mt-1">✓</span>
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardSpotlight>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
