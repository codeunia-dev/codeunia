"use client";

import { motion } from "framer-motion";
import { GitPullRequest, Search, BookOpen, MessageSquare, Star, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OpenSourceSteps() {
    const steps = [
        {
            icon: Search,
            title: "Find a Project",
            description: "Look for projects that interest you. Use tags like 'good first issue' or 'help wanted' to find beginner-friendly tasks.",
            color: "text-blue-500"
        },
        {
            icon: BookOpen,
            title: "Read Documentation",
            description: "Understand the project's goals, setup instructions, and contribution guidelines (CONTRIBUTING.md).",
            color: "text-green-500"
        },
        {
            icon: MessageSquare,
            title: "Join the Community",
            description: "Introduce yourself in the project's communication channels (Discord, Slack, etc.). Ask questions and engage.",
            color: "text-purple-500"
        },
        {
            icon: GitPullRequest,
            title: "Submit a Pull Request",
            description: "Fork the repo, make your changes, test them, and submit a PR. Be open to feedback and iterate.",
            color: "text-orange-500"
        },
        {
            icon: Star,
            title: "Celebrate & Repeat",
            description: "Once merged, celebrate your contribution! Continue contributing and exploring new projects.",
            color: "text-yellow-500"
        }
    ];

    return (
        <section className="py-24 bg-muted/30">
            <div className="container px-4 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                        How to Start <span className="text-primary">Contributing</span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Embarking on your open source journey is easier than you think. Follow these simple steps to make your first contribution.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -z-10" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <step.icon className="w-24 h-24" />
                                </div>

                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300 ${step.color}`}>
                                        <step.icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-xl flex items-center gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-mono text-muted-foreground">
                                            {index + 1}
                                        </span>
                                        {step.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {step.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
