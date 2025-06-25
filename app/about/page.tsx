"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Code2,
    Globe,
    Heart,
    Lightbulb,
    Mail,
    Rocket,
    ShieldCheck,
    Sparkles,
    Target,
    Trophy,
    Users,
} from "lucide-react";

import { SponsorsSection } from "./components/SponsorsSection";
import { TeamSection } from "./components/TeamSection";

export default function AboutPage() {
    const features = [
        {
            icon: Code2,
            title: "Interactive Learning",
            description:
                "Engage with real-time coding challenges, interactive tutorials, and instant feedback on your code.",
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            icon: Users,
            title: "Peer Learning",
            description:
                "Connect with fellow learners, participate in code reviews, and learn through pair programming sessions.",
            gradient: "from-green-500 to-emerald-500",
        },
        {
            icon: Rocket,
            title: "Project-Based",
            description:
                "Build real-world projects from day one, with industry-standard tools and best practices.",
            gradient: "from-purple-500 to-indigo-500",
        },
        {
            icon: Lightbulb,
            title: "Smart Practice",
            description:
                "Get personalized learning paths and practice exercises based on your skill level and goals.",
            gradient: "from-orange-500 to-red-500",
        },
    ];

    const stats = [
        {
            number: "10K+",
            label: "Active Learners",
            icon: Users,
            color: "text-blue-500",
        },
        {
            number: "500+",
            label: "Coding Challenges",
            icon: Code2,
            color: "text-green-500",
        },
        {
            number: "50+",
            label: "Learning Paths",
            icon: Target,
            color: "text-purple-500",
        },
        {
            number: "24/7",
            label: "Support",
            icon: Heart,
            color: "text-red-500",
        },
    ];

    const testimonials = [
        {
            quote: "Interning at Codeunia was a turning point in my journey. The hands-on projects, mentorship, and startup exposure helped me grow both technically and professionally.",
            name: "Aditya Sharma",
            designation: "Frontend Developer",
            src: "/images/testimonials/aditya.jpeg"
        },
        {
            quote: "The structured learning paths and real-world projects made learning to code enjoyable and effective.",
            name: "Maria Garcia",
            designation: "Frontend Developer at Meta",
            src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
        },
        {
            quote: "The community here is amazing. I've made friends and found mentors who've helped me grow as a developer.",
            name: "David Kim",
            designation: "Backend Developer at Netflix",
            src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
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
            {/* Hero Section */}
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
                                        <span>About Us</span>
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
                            Empowering{" "}
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
                                style={{
                                    background:
                                        "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)",
                                    backgroundSize: "300% 100%",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                Developers
                            </motion.span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                        >
                            We&apos;re on a mission to make coding education
                            accessible, engaging, and effective for everyone.
                        </motion.p>
                    </div>
                </motion.div>
            </section>

            {/* Enhanced Stats Section */}
            <section className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent_70%)]"></div>
                <div className="container px-4 mx-auto relative z-10">
                    <motion.div
                        className="max-w-4xl mx-auto"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
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
                                                "bg-gradient-to-br from-primary/10 to-purple-500/10 group-hover:from-primary/20 group-hover:to-purple-500/20"
                                            )}
                                        >
                                            <stat.icon
                                                className={cn(
                                                    "h-6 w-6",
                                                    stat.color
                                                )}
                                            />
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
                    </motion.div>
                </div>
            </section>

            {/* Enhanced Features Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent"></div>
                <div className="container px-4 mx-auto relative z-10">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <motion.div
                            className="text-center space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            {/* copy from here  */}
                            <div className="flex flex-col items-center justify-center gap-4">
                                <button className="bg-slate-800 no-underline group relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block cursor-default">
                                    <span className="absolute inset-0 overflow-hidden rounded-full">
                                        <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    </span>
                                    <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                                        <span>Why Choose Us</span>
                                        <span>
                                            <ShieldCheck className="w-3 h-3" />
                                        </span>
                                    </div>
                                    <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                                </button>
                            </div>
                            {/* to here  */}
                            <h2 className="text-3xl md:text-4xl font-bold">
                                Our{" "}
                                <span className="gradient-text">Features</span>
                            </h2>
                            <p className="text-xl text-muted-foreground">
                                Discover what makes our platform unique and
                                effective for your learning journey.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: index * 0.1,
                                    }}
                                    viewport={{ once: true }}
                                    whileHover={{
                                        y: -8,
                                        transition: { duration: 0.3 },
                                    }}
                                >
                                    <CardSpotlight
                                        className="relative h-full bg-white/50 dark:bg-background/50 backdrop-blur-md border border-primary/10 overflow-hidden"
                                        color="rgba(99, 102, 241, 0.15)"
                                    >
                                        {/* Instead of full overlay, use a radial white fade to preserve spotlight */}
                                        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.7)_0%,_rgba(255,255,255,0)_60%)] dark:bg-none" />

                                        <div className="relative z-10 space-y-4">
                                            <div className="flex items-center space-x-4">
                                                <motion.div
                                                    className={cn(
                                                        "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden",
                                                        `bg-gradient-to-br ${feature.gradient}`
                                                    )}
                                                    whileHover={{
                                                        rotate: [0, -10, 10, 0],
                                                        transition: {
                                                            duration: 0.5,
                                                        },
                                                    }}
                                                >
                                                    <feature.icon className="h-8 w-8 text-white relative z-10" />
                                                    <motion.div
                                                        className="absolute inset-0 bg-white/20"
                                                        initial={{
                                                            scale: 0,
                                                            opacity: 0,
                                                        }}
                                                        whileHover={{
                                                            scale: 1,
                                                            opacity: 1,
                                                            transition: {
                                                                duration: 0.3,
                                                            },
                                                        }}
                                                    />
                                                </motion.div>
                                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                                    {feature.title}
                                                </h3>
                                            </div>
                                            <p className="text-zinc-800 dark:text-foreground/80 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </CardSpotlight>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <TeamSection />

            <SponsorsSection />

            {/* Vision & Roadmap Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="container px-4 mx-auto">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <motion.div
                            className="text-center space-y-6"
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
                                        <span> Our Vision & Mission</span>
                                        <span>
                                            <Target className="w-3 h-3" />
                                        </span>
                                    </div>
                                    <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                                </button>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold">
                                Building the{" "}
                                <span className="gradient-text">Future</span>
                            </h2>
                            <p className="text-xl text-muted-foreground">
                                We believe that everyone should have access to
                                quality coding education. Our mission is to
                                empower developers worldwide with the skills,
                                knowledge, and community support they need to
                                succeed in the tech industry.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                            >
                                <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:-translate-y-2">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary animate-gradient-x rounded-lg"></div>
                                    <div className="absolute inset-[1px] bg-background rounded-lg"></div>
                                    <CardHeader className="relative">
                                        <div className="flex items-center space-x-4">
                                            <motion.div
                                                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-500"
                                                whileHover={{
                                                    rotate: [0, 10, -10, 0],
                                                    transition: {
                                                        duration: 0.5,
                                                    },
                                                }}
                                            >
                                                <Users className="h-7 w-7 text-white" />
                                            </motion.div>
                                            <div>
                                                <CardTitle className="text-2xl font-bold text-primary">
                                                    Community Growth
                                                </CardTitle>
                                                <p className="text-lg font-semibold text-foreground">
                                                    Building Together
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="relative">
                                        <p className="text-muted-foreground leading-relaxed text-lg">
                                            Our goal is to build a vibrant
                                            community of 10,000+ active learners
                                            by the end of 2024, fostering
                                            collaboration and knowledge sharing
                                            among developers of all levels,
                                            regardless of their background or
                                            experience.
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:-translate-y-2">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-primary to-purple-500 animate-gradient-x rounded-lg"></div>
                                    <div className="absolute inset-[1px] bg-background rounded-lg"></div>
                                    <CardHeader className="relative">
                                        <div className="flex items-center space-x-4">
                                            <motion.div
                                                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500"
                                                whileHover={{
                                                    rotate: [0, 10, -10, 0],
                                                    transition: {
                                                        duration: 0.5,
                                                    },
                                                }}
                                            >
                                                <Code2 className="h-7 w-7 text-white" />
                                            </motion.div>
                                            <div>
                                                <CardTitle className="text-2xl font-bold text-primary">
                                                    Learning Platform
                                                </CardTitle>
                                                <p className="text-lg font-semibold text-foreground">
                                                    Innovation First
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="relative">
                                        <p className="text-muted-foreground leading-relaxed text-lg">
                                            We&apos;re developing an AI-powered
                                            learning platform with 500+ coding
                                            challenges and 50+ structured
                                            learning paths to help developers
                                            master their skills in an inclusive
                                            learning environment.
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                viewport={{ once: true }}
                            >
                                <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:-translate-y-2">
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 animate-gradient-x rounded-lg"></div>
                                    <div className="absolute inset-[1px] bg-background rounded-lg"></div>
                                    <CardHeader className="relative">
                                        <div className="flex items-center space-x-4">
                                            <motion.div
                                                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-500"
                                                whileHover={{
                                                    rotate: [0, 10, -10, 0],
                                                    transition: {
                                                        duration: 0.5,
                                                    },
                                                }}
                                            >
                                                <Globe className="h-7 w-7 text-white" />
                                            </motion.div>
                                            <div>
                                                <CardTitle className="text-2xl font-bold text-primary">
                                                    Global Reach
                                                </CardTitle>
                                                <p className="text-lg font-semibold text-foreground">
                                                    Expanding Horizons
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="relative">
                                        <p className="text-muted-foreground leading-relaxed text-lg">
                                            Planning to expand our reach to 50+
                                            countries, making coding education
                                            accessible to developers worldwide
                                            through localized content and
                                            community support, ensuring quality
                                            education for everyone.
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                viewport={{ once: true }}
                            >
                                <Card className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:-translate-y-2">
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-gradient-x rounded-lg"></div>
                                    <div className="absolute inset-[1px] bg-background rounded-lg"></div>
                                    <CardHeader className="relative">
                                        <div className="flex items-center space-x-4">
                                            <motion.div
                                                className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-500"
                                                whileHover={{
                                                    rotate: [0, 10, -10, 0],
                                                    transition: {
                                                        duration: 0.5,
                                                    },
                                                }}
                                            >
                                                <Trophy className="h-7 w-7 text-white" />
                                            </motion.div>
                                            <div>
                                                <CardTitle className="text-2xl font-bold text-primary">
                                                    Career Impact
                                                </CardTitle>
                                                <p className="text-lg font-semibold text-foreground">
                                                    Success Stories
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="relative">
                                        <p className="text-muted-foreground leading-relaxed text-lg">
                                            Aiming to help 1,000+ developers
                                            land their dream jobs in tech
                                            through our comprehensive learning
                                            programs and industry partnerships,
                                            empowering them with the skills and
                                            knowledge to succeed.
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Enhanced Testimonials Section */}
            <section className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.05),transparent_70%)]"></div>
                <div className="container px-4 mx-auto relative z-10">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <motion.div
                            className="text-center space-y-6"
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
                                        <span> Success Stories</span>
                                        <span>
                                            <Trophy className="w-3 h-3" />
                                        </span>
                                    </div>
                                    <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                                </button>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold">
                                What Our{" "}
                                <span className="gradient-text">Learners</span>{" "}
                                Say
                            </h2>
                            <p className="text-xl text-muted-foreground">
                                Real experiences from our community members
                                who&apos;ve transformed their careers.
                            </p>
                        </motion.div>

                        <AnimatedTestimonials
                            testimonials={testimonials}
                            autoplay={true}
                        />
                    </div>
                </div>
            </section>

            {/* Enhanced CTA Section */}
            <section className="py-24 relative overflow-hidden bg-gradient-to-br from-primary/10 via-purple-500/10 to-background dark:from-primary/20 dark:via-purple-500/20 dark:to-background">
                <div className="absolute inset-0">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 dark:bg-primary/30 rounded-full blur-xl animate-float"></div>
                    <div
                        className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500/20 dark:bg-purple-500/30 rounded-full blur-xl animate-float"
                        style={{ animationDelay: "3s" }}
                    ></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="container px-4 mx-auto text-center relative z-10"
                >
                    <motion.div
                        className="max-w-3xl mx-auto space-y-8 p-8 rounded-3xl bg-background/50 dark:bg-background/80 backdrop-blur-md border border-primary/10 dark:border-primary/20 shadow-2xl relative overflow-hidden group"
                        whileHover={{
                            y: -8,
                            transition: { duration: 0.3 },
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <motion.div
                            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 1.5, delay: 0.3 }}
                            viewport={{ once: true }}
                            style={{ originX: 0 }}
                        />

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            <Badge
                                variant="secondary"
                                className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/90 border-primary/20 dark:border-primary/30 px-6 py-3 text-sm font-semibold"
                            >
                                <Rocket className="w-4 h-4 mr-2" />
                                Start Your Journey
                            </Badge>
                        </motion.div>

                        <motion.h2
                            className="text-4xl md:text-6xl font-bold text-foreground dark:text-foreground/90 leading-tight"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            viewport={{ once: true }}
                        >
                            Ready to Begin Your{" "}
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
                                style={{
                                    background:
                                        "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)",
                                    backgroundSize: "300% 100%",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                Coding Adventure?
                            </motion.span>
                        </motion.h2>

                        <motion.p
                            className="text-xl text-muted-foreground dark:text-muted-foreground/90 leading-relaxed"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            viewport={{ once: true }}
                        >
                            Join thousands of developers who are already
                            learning and growing with Codeunia. Transform your
                            career with our comprehensive learning platform.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    size="lg"
                                    variant="default"
                                    className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 relative overflow-hidden group"
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-white/20"
                                        initial={{ x: "-100%" }}
                                        whileHover={{ x: "100%" }}
                                        transition={{ duration: 0.6 }}
                                    />
                                    <span className="relative z-10 flex items-center">
                                        Get Started
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </span>
                                </Button>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="px-8 py-6 text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300 relative overflow-hidden group"
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-primary/5"
                                        initial={{ scale: 0 }}
                                        whileHover={{ scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    <span className="relative z-10 flex items-center">
                                        Contact Us
                                        <Mail className="ml-2 h-5 w-5" />
                                    </span>
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* Floating particles */}
                        <div className="absolute inset-0 pointer-events-none">
                            <motion.div
                                className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full"
                                animate={{
                                    y: [0, -20, 0],
                                    x: [0, 10, 0],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                            <motion.div
                                className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-500/30 rounded-full"
                                animate={{
                                    y: [0, 15, 0],
                                    x: [0, -15, 0],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 2,
                                }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </section>
            <Footer />
        </div>
    );
}
