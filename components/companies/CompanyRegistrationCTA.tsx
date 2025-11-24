"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Building2, Users, Calendar, Briefcase, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const benefits = [
    {
        icon: Users,
        title: "Reach Developers",
        description: "Access 3000+ active developers looking for events, hackathons, and learning opportunities.",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        icon: Building2,
        title: "Build Brand",
        description: "Verified badge and professional presence to establish credibility in the developer community.",
        gradient: "from-purple-500 to-pink-500",
    },
    {
        icon: Calendar,
        title: "Track Impact",
        description: "Comprehensive analytics dashboard to measure event success and engagement metrics.",
        gradient: "from-green-500 to-emerald-500",
    },
    {
        icon: Briefcase,
        title: "Team Management",
        description: "Collaborative event creation with role-based permissions for your entire team.",
        gradient: "from-orange-500 to-red-500",
    },
]

export function CompanyRegistrationCTA() {
    return (
        <section className="py-20 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent_70%)]"></div>

            <div className="container px-4 mx-auto relative z-10">
                <motion.div
                    className="text-center space-y-6 mb-12"
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
                            </div>
                            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                        </button>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                        Is Your Company Ready to{" "}
                        <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                            Host Events?
                        </span>
                    </h2>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Join verified companies engaging developers on Codeunia
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8, transition: { duration: 0.3 } }}
                            className="relative"
                        >
                            <div className="h-full bg-background/50 backdrop-blur-sm border border-primary/10 rounded-2xl p-6 space-y-4 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        className={cn(
                                            "w-14 h-14 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0",
                                            `bg-gradient-to-br ${benefit.gradient}`
                                        )}
                                        whileHover={{
                                            rotate: [0, -10, 10, 0],
                                            transition: { duration: 0.5 },
                                        }}
                                    >
                                        <benefit.icon className="h-7 w-7 text-white" />
                                    </motion.div>

                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-1">{benefit.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className="text-center space-y-6"
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
                            <Link href="/companies/register" className="flex items-center gap-2">
                                Register Your Company
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            className="px-8 py-6 text-lg font-semibold hover:scale-105 transition-all duration-300"
                            asChild
                        >
                            <Link href="/companies/host">Learn More</Link>
                        </Button>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>Free for verified companies</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>24-48 hour verification</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
