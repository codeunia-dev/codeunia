"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gift, Sparkles } from "lucide-react";
import Image from "next/image";

export function SwagShowcase() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 md:py-24">
            {/* Animated background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.15),transparent_50%)]" />

            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Swag Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl blur-2xl opacity-30 animate-pulse" />
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                            <Image
                                src="/assets/oscg-swag-banner.jpg"
                                alt="OSCG 2026 Exclusive Swags - Hoodie, Cap, Bottle, and Bag"
                                width={600}
                                height={400}
                                className="w-full h-auto object-cover"
                                priority
                            />
                        </div>
                    </motion.div>

                    {/* Right: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold">
                            <Gift className="w-4 h-4" />
                            <span>Exclusive Rewards</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Grab Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">Swag</span> and Power Up the{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400">Open Source Spirit</span>
                        </h2>

                        <p className="text-lg text-slate-300 leading-relaxed">
                            Active contributors to OSCG 2026 will earn exclusive branded merchandise including hoodies, caps, water bottles, and backpacks. Show your open source pride!
                        </p>

                        <ul className="space-y-3">
                            {[
                                "Premium quality branded hoodie",
                                "Stylish cap with embroidered logo",
                                "Eco-friendly water bottle",
                                "Durable backpack for your gear"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-200">
                                    <Sparkles className="w-5 h-5 text-green-400 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="pt-4">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-lg px-8"
                                asChild
                            >
                                <a
                                    href="https://luma.com/vyb4bntj?tk=dlAVyb"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2"
                                >
                                    <span>Register for OSCG 2026</span>
                                    <ArrowRight className="w-5 h-5" />
                                </a>
                            </Button>
                            <p className="mt-3 text-sm text-slate-400">
                                Limited swags available • First come, first served
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
