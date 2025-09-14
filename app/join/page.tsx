"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Handshake,
    Lightbulb,
    Mail,
    Sparkles,
    Trophy,
    Users,
    Award,
    HandHeart,
    Crown,
} from "lucide-react";
import Link from "next/link";

export default function JoinPage() {
    const joinOptions = [
        {
            icon: Handshake,
            title: "Codeunia Collaboration Form",
            description: "Collaborate with us to create innovative learning experiences and expand your reach in the developer community.",
            gradient: "from-blue-500 to-cyan-500",
            href: "/join/collaboration",
            color: "text-blue-500",
        },
        {
            icon: Trophy,
            title: "Codeunia Sponsorship Form",
            description: "Support our mission by becoming a sponsor and help us create more opportunities for developers.",
            gradient: "from-green-500 to-emerald-500",
            href: "/join/sponsorship",
            color: "text-green-500",
        },
        {
            icon: Lightbulb,
            title: "Codeunia Mentor Registration",
            description: "Share your expertise and guide the next generation of developers through their learning journey.",
            gradient: "from-purple-500 to-indigo-500",
            href: "/join/mentor",
            color: "text-purple-500",
        },
        {
            icon: Award,
            title: "Codeunia Judges Registration",
            description: "Join our panel of judges to evaluate projects and provide valuable feedback to participants.",
            gradient: "from-orange-500 to-red-500",
            href: "/join/judges",
            color: "text-orange-500",
        },
        {
            icon: HandHeart,
            title: "Codeunia Volunteer Application",
            description: "Contribute your time and skills to help organize events and support our community initiatives.",
            gradient: "from-pink-500 to-rose-500",
            href: "/join/volunteer",
            color: "text-pink-500",
        },
        {
            icon: Crown,
            title: "Codeunia Core Team Application",
            description: "Join our core team including media, content, and leadership roles to help shape Codeunia's future.",
            gradient: "from-amber-500 to-yellow-500",
            href: "/join/core-team",
            color: "text-amber-500",
        },
    ];

    const stats = [
        {
            number: "100+",
            label: "Collaborators",
            icon: Handshake,
            color: "text-blue-500",
        },
        {
            number: "10+",
            label: "Mentors",
            icon: Lightbulb,
            color: "text-green-500",
        },
        {
            number: "5+",
            label: "Judges",
            icon: Award,
            color: "text-purple-500",
        },
        {
            number: "50+",
            label: "Volunteers",
            icon: HandHeart,
            color: "text-orange-500",
        },
        {
            number: "15+",
            label: "Core Team",
            icon: Crown,
            color: "text-amber-500",
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
                                        <span>Join Our Community</span>
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
                            Join{" "}
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
                            Be part of something bigger. Choose how you want to contribute to our mission of empowering developers worldwide.
                        </motion.p>
                    </div>
                </motion.div>
            </section>

            {/* stats section */}
            <section className="py-16 bg-muted/30">
                <div className="container px-4 mx-auto">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="text-center"
                            >
                                <div className="flex flex-col items-center space-y-2">
                                    <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <div className="text-3xl font-bold">{stat.number}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* join options section */}
            <section className="py-20">
                <div className="container px-4 mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Choose Your Path
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            There are many ways to get involved with Codeunia. Find the perfect opportunity that matches your skills and interests.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {joinOptions.map((option, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="group"
                            >
                                <CardSpotlight className="h-full">
                                    <Card className="h-full border-0 bg-background/60 backdrop-blur-xl hover:bg-background/80 transition-all duration-300 group-hover:shadow-2xl">
                                        <CardHeader className="text-center pb-4">
                                            <div className={`mx-auto p-3 rounded-full bg-gradient-to-r ${option.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                                <option.icon className="h-8 w-8 text-white" />
                                            </div>
                                            <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                                                {option.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-center space-y-4">
                                            <p className="text-muted-foreground leading-relaxed">
                                                {option.description}
                                            </p>
                                            <Button 
                                                className="w-full group-hover:scale-105 transition-transform duration-300"
                                                variant="outline"
                                                asChild
                                            >
                                                <Link href={option.href}>
                                                    Apply Now
                                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </CardSpotlight>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* cta section */}
            <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
  <div className="container px-4 mx-auto text-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <h2 className="text-3xl md:text-4xl font-bold">
        Have Questions or Want to Explore More?
      </h2>
      <p className="text-xl text-muted-foreground">
        Whether you&apos;re looking to get in touch or learn more about our mission, we&apos;re here to help you get started.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="glow-effect" asChild>
          <Link href="/contact" className="flex items-center justify-center">
            <Mail className="mr-2 h-5 w-5" />
            Contact Us
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/about" className="flex items-center justify-center">
            <Users className="mr-2 h-5 w-5" />
            Learn More
          </Link>
        </Button>
      </div>
    </motion.div>
  </div>
</section>
            <Footer />
        </div>
    );
} 