"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { CollaborationForm } from "@/components/forms/collaboration-form";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkles, Handshake, Users, Star, Globe } from "lucide-react";

export default function CollaborationPage() {
    const benefits = [
        {
            icon: Handshake,
            title: "Strategic Collaboration",
            description: "Build long-term collaborations that drive mutual growth and innovation in the tech ecosystem.",
            color: "text-blue-500",
        },
        {
            icon: Users,
            title: "Community Access",
            description: "Connect with our diverse network of developers, students, and tech professionals.",
            color: "text-green-500",
        },
        {
            icon: Star,
            title: "Brand Amplification",
            description: "Leverage our platform and events to increase your brand visibility and reach.",
            color: "text-purple-500",
        },
        {
            icon: Globe,
            title: "Global Impact",
            description: "Join us in creating positive change in the global developer community.",
            color: "text-orange-500",
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    };

    return (
        <div className="flex flex-col overflow-hidden">
            <Header />
            
            {/* hero section */}
            <section className="py-20 md:py-32 relative overflow-hidden">
                <div
                    className={cn(
                        "absolute inset-0",
                        "[background-size:20px_20px]",
                        "[background-image:linear-gradient(to_right,rgba(99,102,241,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.8)_1px,transparent_1px)]",
                        "dark:[background-image:linear-gradient(to_right,rgba(139,92,246,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.8)_1px,transparent_1px)]"
                    )}
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 animate-gradient"></div>
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
                    <div
                        className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"
                        style={{ animationDelay: "2s" }}
                    ></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="container px-4 mx-auto relative z-10"
                >
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex flex-col items-center justify-center gap-4">
                                <button className="bg-slate-800 no-underline group relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block cursor-default">
                                    <span className="absolute inset-0 overflow-hidden rounded-full">
                                        <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    </span>
                                    <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                                        <span>Collaboration Form</span>
                                        <span>
                                            <Sparkles className="w-3 h-3" />
                                        </span>
                                    </div>
                                    <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                                </button>
                            </div>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-5xl md:text-6xl font-bold tracking-tight leading-tight"
                        >
                            Collaborate with{" "}
                            <motion.span
                                className="gradient-text inline-block"
                                animate={{
                                    backgroundPosition: [
                                        "0% 50%",
                                        "100% 50%",
                                        "0% 50%",
                                    ],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            >
                                Codeunia
                            </motion.span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="text-xl text-muted-foreground max-w-2xl mx-auto"
                        >
                            Join forces with us to create meaningful impact in the tech community. Let&apos;s build something amazing together.
                        </motion.p>
                    </div>
                </motion.div>
            </section>

            {/* benefits section */}
            <section className="py-16 bg-muted/30">
                <div className="container px-4 mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Why Collaborate with Codeunia?
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Discover the benefits of collaborating with us and how we can create value together.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="text-center group"
                            >
                                <div className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-background/60 backdrop-blur-xl hover:bg-background/80 transition-all duration-300 group-hover:shadow-lg">
                                    <div className={`p-3 rounded-full bg-muted group-hover:scale-110 transition-transform duration-300 ${benefit.color}`}>
                                        <benefit.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* form section */}
            <section className="py-20">
                <div className="container px-4 mx-auto">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Ready to Collaborate with Us?
                            </h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Fill out the form below to explore collaboration opportunities. We&apos;ll get back to you within 48 hours with a customized proposal.
                            </p>
                        </motion.div>

                        <CollaborationForm />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
