"use client"

import { motion } from "framer-motion"
import { Building2, Calendar, Users, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

interface CompanyStatsBannerProps {
    totalCompanies?: number
    totalEvents?: number
    totalDevelopers?: number
    totalIndustries?: number
}

export function CompanyStatsBanner({
    totalCompanies = 50,
    totalEvents = 200,
    totalDevelopers = 3000,
    totalIndustries = 15,
}: CompanyStatsBannerProps) {
    const stats = [
        {
            number: `${totalCompanies}+`,
            label: "Verified Companies",
            icon: Building2,
            color: "text-blue-500",
            gradient: "from-blue-500/10 to-cyan-500/10",
        },
        {
            number: `${totalEvents}+`,
            label: "Events Hosted",
            icon: Calendar,
            color: "text-purple-500",
            gradient: "from-purple-500/10 to-pink-500/10",
        },
        {
            number: `${totalDevelopers}+`,
            label: "Developers Reached",
            icon: Users,
            color: "text-green-500",
            gradient: "from-green-500/10 to-emerald-500/10",
        },
        {
            number: `${totalIndustries}+`,
            label: "Industries",
            icon: Briefcase,
            color: "text-orange-500",
            gradient: "from-orange-500/10 to-red-500/10",
        },
    ]

    return (
        <section className="py-12 bg-gradient-to-b from-muted/30 to-background relative border-b border-primary/10">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="text-center space-y-3 p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-md group"
                        >
                            <div className="flex justify-center">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                                        `bg-gradient-to-br ${stat.gradient}`
                                    )}
                                >
                                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                                </div>
                            </div>

                            <motion.h3
                                className="text-3xl font-bold text-primary"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1 + 0.2,
                                }}
                            >
                                {stat.number}
                            </motion.h3>

                            <p className="text-sm text-muted-foreground font-medium">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
