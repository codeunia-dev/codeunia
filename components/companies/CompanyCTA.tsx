"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mail } from "lucide-react"
import Link from "next/link"
import { SparklesCore } from "@/components/ui/sparkles"

export function CompanyCTA() {
    return (
        <section className="py-20 md:py-24 relative overflow-hidden bg-gradient-to-br from-primary/10 via-purple-500/10 to-background dark:from-primary/20 dark:via-purple-500/20 dark:to-background">
            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 dark:bg-primary/30 rounded-full blur-xl animate-float"></div>
                <div
                    className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500/20 dark:bg-purple-500/30 rounded-full blur-xl animate-float"
                    style={{ animationDelay: "3s" }}
                ></div>
            </div>

            {/* Sparkles effect */}
            <div className="absolute inset-0 h-full w-full">
                <SparklesCore
                    id="company-cta-sparkles"
                    background="transparent"
                    minSize={0.6}
                    maxSize={1.4}
                    particleDensity={100}
                    className="w-full h-full"
                    particleColor="#6366f1"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="container px-4 mx-auto text-center relative z-10"
            >
                <div className="max-w-3xl mx-auto space-y-8 p-8 md:p-10 rounded-3xl bg-background/50 dark:bg-background/80 backdrop-blur-md border border-primary/10 dark:border-primary/20 shadow-xl">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <button className="bg-slate-800 no-underline group cursor-default relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block">
                            <span className="absolute inset-0 overflow-hidden rounded-full">
                                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            </span>
                            <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                                <span>Ready to Get Started?</span>
                            </div>
                            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                        </button>
                    </div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
                    >
                        Ready to Engage the{" "}
                        <motion.span
                            className="gradient-text inline-block"
                            animate={{
                                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            style={{
                                background:
                                    "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)",
                                backgroundSize: "300% 100%",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Developer Community?
                        </motion.span>
                    </motion.h2>

                    <p className="text-lg md:text-xl text-muted-foreground dark:text-muted-foreground/90 leading-relaxed">
                        Join 50+ verified companies hosting impactful events on Codeunia. Start engaging with 3000+ developers today.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                            className="px-8 py-6 text-lg font-semibold hover:scale-105 transition-transform duration-300"
                            asChild
                        >
                            <Link href="/contact" className="flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                Contact Us
                            </Link>
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Questions? Check out our{" "}
                        <Link href="/companies/faq" className="text-primary hover:underline">
                            FAQ
                        </Link>{" "}
                        or{" "}
                        <Link href="/contact" className="text-primary hover:underline">
                            contact our team
                        </Link>
                    </p>
                </div>
            </motion.div>
        </section>
    )
}
