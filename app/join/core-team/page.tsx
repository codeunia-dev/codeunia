"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { CoreTeamForm } from "@/components/forms/core-team-form";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkles, Crown, Users, Zap, Award } from "lucide-react";

export default function CoreTeamPage() {
    const benefits = [
        {
            icon: Crown,
            title: "Leadership Role",
            description: "Take on leadership responsibilities and help shape the future direction of Codeunia.",
            color: "text-amber-500",
        },
        {
            icon: Users,
            title: "Team Collaboration",
            description: "Work closely with other core team members and build lasting professional relationships.",
            color: "text-blue-500",
        },
        {
            icon: Zap,
            title: "Creative Freedom",
            description: "Bring your innovative ideas to life and have a direct impact on our community initiatives.",
            color: "text-purple-500",
        },
        {
            icon: Award,
            title: "Recognition & Growth",
            description: "Get recognized for your contributions and develop valuable skills in your chosen field.",
            color: "text-green-500",
        },
    ];

    const roles = [
        {
            title: "Media Team",
            description: "Content creation, social media management, video production, and brand development.",
            icon: "🎥",
        },
        {
            title: "Content Team",
            description: "Blog writing, technical documentation, educational content, and community resources.",
            icon: "📝",
        },
        {
            title: "Technical Team",
            description: "Platform development, technical infrastructure, and developer tooling.",
            icon: "⚙️",
        },
        {
            title: "Community Team",
            description: "Community management, event coordination, and member engagement.",
            icon: "🤝",
        },
        {
            title: "Strategy Team",
            description: "Strategic planning, partnerships, and long-term vision development.",
            icon: "🎯",
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
                    <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
                    <div
                        className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse-slow"
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
                                        <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(245,158,11,0.6)_0%,rgba(245,158,11,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    </span>
                                    <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                                        <span>Core Team Application</span>
                                        <span>
                                            <Sparkles className="w-3 h-3" />
                                        </span>
                                    </div>
                                    <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-amber-400/0 via-amber-400/90 to-amber-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                                </button>
                            </div>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-5xl md:text-6xl font-bold tracking-tight leading-tight"
                        >
                            Join Our{" "}
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
                                Core Team
                            </motion.span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="text-xl text-muted-foreground max-w-2xl mx-auto"
                        >
                            Be part of the driving force behind Codeunia. Help us build the future of developer education and community.
                        </motion.p>
                    </div>
                </motion.div>
            </section>

            {/* roles section */}
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
                            Available Core Team Roles
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Choose the role that best matches your skills and interests.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {roles.map((role, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="group"
                            >
                                <div className="p-6 rounded-xl bg-background/60 backdrop-blur-xl hover:bg-background/80 transition-all duration-300 group-hover:shadow-lg border border-border/50">
                                    <div className="text-4xl mb-4">{role.icon}</div>
                                    <h3 className="text-xl font-semibold mb-3 group-hover:text-amber-500 transition-colors duration-300">
                                        {role.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {role.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* benefits section */}
            <section className="py-16">
                <div className="container px-4 mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Why Join Our Core Team?
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Discover the unique benefits of being part of Codeunia&apos;s core team.
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
            <section className="py-20 bg-muted/30">
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
                                Ready to Lead with Us?
                            </h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Fill out the application below to join our core team. We&apos;ll review your application and get back to you within 72 hours.
                            </p>
                        </motion.div>

                        <CoreTeamForm />
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
