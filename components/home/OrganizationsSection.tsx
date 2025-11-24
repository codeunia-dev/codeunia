"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Building2, Users, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const features = [
    {
        icon: Building2,
        title: "Verified Company Profiles",
        description: "Build credibility with verified badges. Showcase your brand to 3000+ developers with custom company pages.",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        icon: Sparkles,
        title: "Event & Hackathon Management",
        description: "Create unlimited events and hackathons. Built-in registration, participant tracking, and real-time analytics.",
        gradient: "from-purple-500 to-pink-500",
    },
    {
        icon: Users,
        title: "Team Collaboration",
        description: "Invite team members with role-based access. Owner, Admin, Editor, and Viewer roles for collaborative event creation.",
        gradient: "from-green-500 to-emerald-500",
    },
]

export function OrganizationsSection() {
    return (
        <section className="py-20 md:py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent_70%)]"></div>

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
                                <span>For Organizations</span>
                                <span>
                                    <Building2 className="w-3 h-3" />
                                </span>
                            </div>
                            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                        </button>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                        Host Events &{" "}
                        <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                            Engage Developers
                        </span>
                    </h2>

                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Empower your organization to create, manage, and promote tech events at scale
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8, transition: { duration: 0.3 } }}
                            className="relative"
                        >
                            <div className="h-full bg-background/50 backdrop-blur-sm border border-primary/10 rounded-2xl p-8 space-y-6 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group">
                                <motion.div
                                    className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
                                        `bg-gradient-to-br ${feature.gradient}`
                                    )}
                                    whileHover={{
                                        rotate: [0, -10, 10, 0],
                                        transition: { duration: 0.5 },
                                    }}
                                >
                                    <feature.icon className="h-8 w-8 text-white" />
                                </motion.div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                >
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            asChild
                        >
                            <Link href="/companies/host" className="flex items-center gap-2">
                                Learn More
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            className="px-8 py-6 text-lg font-semibold hover:scale-105 transition-all duration-300"
                            asChild
                        >
                            <Link href="/companies">Browse Companies</Link>
                        </Button>
                    </div>

                    <p className="mt-6 text-sm text-muted-foreground">
                        Join 50+ verified companies already hosting events on Codeunia
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
