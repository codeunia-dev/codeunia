"use client"

import { motion } from "framer-motion"
import { CheckCircle, FileCheck, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
    {
        number: "01",
        icon: FileCheck,
        title: "Register Your Company",
        description: "Fill out the registration form with company details, upload verification documents, and submit for review.",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        number: "02",
        icon: CheckCircle,
        title: "Get Verified",
        description: "Our admin team reviews your application within 24-48 hours. Receive email notification upon approval.",
        gradient: "from-purple-500 to-pink-500",
    },
    {
        number: "03",
        icon: Rocket,
        title: "Start Hosting Events",
        description: "Access your dashboard, invite team members, create events, and engage with the developer community.",
        gradient: "from-orange-500 to-red-500",
    },
]

export function HowItWorksSection() {
    return (
        <section className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
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
                                <span>Simple Process</span>
                            </div>
                            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                        </button>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                        Get Started in{" "}
                        <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                            3 Simple Steps
                        </span>
                    </h2>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        From registration to hosting your first event in just a few days
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8, transition: { duration: 0.3 } }}
                            className="relative"
                        >
                            <div className="h-full bg-background/50 backdrop-blur-sm border border-primary/10 rounded-2xl p-8 space-y-6 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                                {/* Step Number */}
                                <div className="flex items-start justify-between">
                                    <span className="text-6xl font-bold text-primary/10">
                                        {step.number}
                                    </span>
                                    <motion.div
                                        className={cn(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
                                            `bg-gradient-to-br ${step.gradient}`
                                        )}
                                        whileHover={{
                                            rotate: [0, -10, 10, 0],
                                            transition: { duration: 0.5 },
                                        }}
                                    >
                                        <step.icon className="h-8 w-8 text-white" />
                                    </motion.div>
                                </div>

                                {/* Content */}
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-bold">{step.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Connector Line (except for last item) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
