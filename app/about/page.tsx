"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
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
    UserPlus,
} from "lucide-react";

import { SponsorsSection } from "./components/SponsorsSection";
import { TeamSection } from "./components/TeamSection";
import { SparklesCore } from "@/components/ui/sparkles"
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

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
            number: "600+",
            label: "Active Learners",
            icon: Users,
            color: "text-blue-500",
        },
        {
            number: "10+",
            label: "Coding Challenges",
            icon: Code2,
            color: "text-green-500",
        },
        {
            number: "20+",
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
        }
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

    const { user, loading } = useAuth();

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

            <SponsorsSection />

            {/* Team Section */}
            <TeamSection />

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
                                        <span>Success Stories</span>
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
            {(() => {
              if (loading) return null;
              return (
                <section className="py-24 relative overflow-hidden bg-gradient-to-br from-primary/10 via-purple-500/10 to-background dark:from-primary/20 dark:via-purple-500/20 dark:to-background">
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
                          id="tsparticlesfullpage"
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
                      <div className="max-w-3xl mx-auto space-y-8 p-8 rounded-3xl bg-background/50 dark:bg-background/80 backdrop-blur-md border border-primary/10 dark:border-primary/20 shadow-xl">
                        {user ? (
                          <>
                            <div className="flex flex-col items-center justify-center gap-4">
                                <button className="bg-slate-800 no-underline group cursor-default relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block">
                                    <span className="absolute inset-0 overflow-hidden rounded-full">
                                        <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    </span>
                                    <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                                        <span>Welcome Back!</span>
                                        <span>
                                            <Sparkles className="w-3 h-3" />
                                        </span>
                                    </div>
                                    <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                                </button>
                            </div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-5xl md:text-6xl font-bold tracking-tight leading-tight"
                            >
                                Ready to Continue Your {" "}
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
                                    Coding Journey?
                                </motion.span>
                            </motion.h1>
                            <p className="text-xl text-muted-foreground dark:text-muted-foreground/90 leading-relaxed">
                              Continue your learning journey with personalized content, track your progress, and connect with our community.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                              <Button
                                size="sm"
                                variant="default"
                                className="sm:w-auto px-6 py-3 text-base font-semibold hover:scale-105 transition-all duration-300"
                                asChild
                              >
                                <Link href="/protected/dashboard" className="h-full flex items-center justify-center gap-2">
                                  <Rocket className="w-5 h-5" />
                                  Go to Dashboard
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="sm:w-auto px-6 py-3 text-base font-semibold hover:scale-105 transition-transform duration-300"
                                asChild
                              >
                                <Link href="/hackathons" className="h-full flex items-center justify-center gap-2">
                                  <Globe className="w-5 h-5" />
                                  View Events
                                </Link>
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex flex-col items-center justify-center gap-4">
                                <button className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block">
                                    <span className="absolute inset-0 overflow-hidden rounded-full">
                                        <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    </span>
                                    <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-1 px-4 ring-1 ring-white/10">
                                        <span>Start Your Journey 🚀</span>
                                    </div>
                                    <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                                </button>
                            </div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-5xl md:text-6xl font-bold tracking-tight leading-tight"
                            >
                                Ready to Begin Your {" "}
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
                            </motion.h1>
                            <p className="text-xl text-muted-foreground dark:text-muted-foreground/90 leading-relaxed">
                              Join thousands of developers who are already learning and growing with Codeunia. Transform your career with our comprehensive learning platform.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                              <Button
                                size="sm"
                                variant="default"
                                className="sm:w-auto px-6 py-3 text-base font-semibold hover:scale-105 transition-all duration-300"
                                asChild
                              >
                                <Link href="/auth/signup" className="h-full flex items-center justify-center gap-2">
                                  <UserPlus className="w-5 h-5" />
                                  Get Started
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="sm:w-auto px-6 py-3 text-base font-semibold hover:scale-105 transition-transform duration-300"
                                asChild
                              >
                                <Link href="/contact" className="h-full flex items-center justify-center gap-2">
                                  <Mail className="w-5 h-5" />
                                  Contact Us
                                </Link>
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                  </motion.div>
                </section>
              );
            })()}
            <Footer />
        </div>
    );
} 