"use client"

import { motion } from "framer-motion"
import { Building2, Calendar, Users as UsersIcon, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
    {
        number: "50+",
        label: "Verified Companies",
        icon: Building2,
        color: "text-blue-500",
        gradient: "from-blue-500/10 to-cyan-500/10",
    },
    {
        number: "200+",
        label: "Events Hosted",
        icon: Calendar,
        color: "text-purple-500",
        gradient: "from-purple-500/10 to-pink-500/10",
    },
    {
        number: "3000+",
        label: "Developers Reached",
        icon: UsersIcon,
        color: "text-green-500",
        gradient: "from-green-500/10 to-emerald-500/10",
    },
    {
        number: "15+",
        label: "Industries",
        icon: Briefcase,
        color: "text-orange-500",
        gradient: "from-orange-500/10 to-red-500/10",
    },
]

export function CompanyStats() {
    return (
        <section className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent_70%)]"></div>

            <div className="container px-4 mx-auto relative z-10">
                <motion.div
                    className="text-center space-y-6 mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold">
                        Trusted by{" "}
                        <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                            Leading Organizations
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Join companies already engaging developers on Codeunia
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{
                                scale: 1.05,
                                transition: { duration: 0.2 },
                            }}
                            className="text-center space-y-4 p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-lg group"
                        >
                            <div className="flex justify-center">
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                                        `bg-gradient-to-br ${stat.gradient} group-hover:shadow-lg`
                                    )}
                                >
                                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                                </div>
                            </div>

                            <motion.h3
                                className="text-4xl font-bold text-primary"
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.1 + 0.2,
                                }}
                                viewport={{ once: true }}
                            >
                                {stat.number}
                            </motion.h3>

                            <p className="text-muted-foreground font-medium">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
