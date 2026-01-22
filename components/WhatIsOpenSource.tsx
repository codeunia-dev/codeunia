"use client";

import { motion } from "framer-motion";
import { ArrowRight, Globe, Code2, Users, GitBranch, Terminal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function WhatIsOpenSource() {
    return (
        <section className="relative overflow-hidden bg-background">
            <div className="container px-4 mx-auto relative z-10 py-12 md:py-16">
                <div className="max-w-5xl mx-auto">

                    {/* Main Content: What is Open Source? */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                                The Essence of <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Open Source</span>
                            </h2>

                            <div className="prose prose-lg dark:prose-invert leading-relaxed text-muted-foreground">
                                <p className="text-xl md:text-2xl font-light text-foreground/90">
                                    Open source is a philosophy that promotes free redistribution and access to an end product's design and implementation details.
                                </p>
                                <p>
                                    In the world of software, it means the code is available for anyone to inspect, modify, and enhance. It's built on the belief that <span className="text-primary font-medium">collaborative development</span> creates better, more resilient, and more innovative software than any single company could build alone.
                                </p>
                            </div>
                        </motion.div>

                        {/* Key Benefits Grid */}
                        <div className="grid sm:grid-cols-2 gap-6 pt-4">
                            {[
                                {
                                    icon: Users,
                                    title: "Community Driven",
                                    desc: "Powered by a global community of developers working together.",
                                    gradient: "from-blue-500 to-purple-600"
                                },
                                {
                                    icon: GitBranch,
                                    title: "Transparency",
                                    desc: "Code that is open for everyone to review, audit, and improve.",
                                    gradient: "from-green-500 to-blue-500"
                                },
                                {
                                    icon: Code2,
                                    title: "Collaboration",
                                    desc: "Learn from others' code and contribute your own solutions.",
                                    gradient: "from-purple-500 to-pink-500"
                                },
                                {
                                    icon: Sparkles,
                                    title: "Innovation",
                                    desc: "Rapid evolution through shared ideas and collective problem solving.",
                                    gradient: "from-orange-500 to-red-500"
                                }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.1 * index }}
                                    className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`} />

                                    <div className="flex gap-4">
                                        <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} p-2.5 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                            <item.icon className="w-full h-full text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground text-lg">{item.title}</h3>
                                            <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
