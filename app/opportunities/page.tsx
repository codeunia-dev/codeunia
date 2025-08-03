"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Calendar, Trophy, Briefcase, ArrowRight, Sparkles, Code2, FileText, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const opportunities = [
  {
    title: "Hackathons",
    description: "Compete in online and offline hackathons. Build, learn, and win prizes!",
    icon: Trophy,
    href: "/hackathons",
    gradient: "from-amber-500 to-orange-600",
    tags: ["Coding", "Competition", "Innovation"],
  },
  {
    title: "Events",
    description: "Explore and participate in the latest tech events, workshops, and conferences.",
    icon: Calendar,
    href: "/hackathons",
    gradient: "from-blue-500 to-indigo-600",
    tags: ["Tech", "Workshops", "Conferences"],
  },
  {
    title: "Projects",
    description: "Join real-world projects and collaborations. Grow your portfolio and skills.",
    icon: Code2,
    href: "/projects",
    gradient: "from-emerald-500 to-teal-600",
    tags: ["Collaboration", "Portfolio", "Open Source"],
  },
  {
    title: "Tests & Assessments",
    description: "Take skill assessments, interview prep tests, and earn certificates to boost your career.",
    icon: FileText,
    href: "/tests",
    gradient: "from-rose-500 to-red-600",
    tags: ["Interview Prep", "Certificates", "Skills"],
  },
  {
    title: "Jobs & Internships",
    description: "Find the best jobs and internships in tech. Hybrid, onsite, and remote opportunities.",
    icon: Briefcase,
    href: "/internship",
    gradient: "from-purple-500 to-pink-600",
    tags: ["Jobs", "Internships", "Remote"],
  },
  {
    title: "BuildUnia",
    description: "Purchase and learn IoT projects. Build smart devices and explore the world of connected technology.",
    icon: Cpu,
    href: "https://buildunia.codeunia.com",
    gradient: "from-cyan-500 to-blue-600",
    tags: ["IoT", "Hardware", "Learning"],
  },
];

export default function OpportunitiesPage() {
  return (
    <div className="flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/10 min-h-screen">
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div>
              <div className="flex flex-col items-center justify-center gap-4">
                <button className="bg-slate-800 no-underline group relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block cursor-default">
                  <span className="absolute inset-0 overflow-hidden rounded-full">
                    <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 group-hover:opacity-100" />
                  </span>
                  <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                    <span>Opportunities Hub</span>
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 group-hover:opacity-40" />
                </button>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
              Unlock All Tech <span className="gradient-text">Opportunities</span> in One Place
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Navigate to events, hackathons, projects, tests, jobs, and internships curated for the tech community.
            </p>
          </div>
        </div>
      </section>
      {/* Opportunities Grid */}
      <section className="py-16 bg-gradient-to-b from-muted/30 to-background relative">
        <div className="container px-4 mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {opportunities.map((item) => (
              <div key={item.title}>
                <Card className={cn(
                  "group relative overflow-hidden border-0 shadow-xl card-hover bg-gradient-to-br from-background to-muted/20 flex flex-col h-full",
                  `hover:shadow-2xl`)}>
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 rounded-2xl",
                    `bg-gradient-to-br ${item.gradient}`
                  )}></div>
                  <CardHeader className="relative z-10 pb-2 flex flex-col items-center">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg",
                      `bg-gradient-to-br ${item.gradient}`
                    )}>
                      <item.icon className="h-7 w-7 text-white drop-shadow-lg" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center group-hover:text-white">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground text-center group-hover:text-white/90">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10 flex flex-col flex-1 justify-between">
                    <div className="flex flex-wrap gap-2 justify-center mb-6 mt-2">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      asChild
                      size="lg"
                      className="w-full font-semibold px-6 py-2 rounded-full text-base bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg focus:ring-2 focus:ring-primary/40"
                    >
                      <Link href={item.href} className="flex items-center justify-center whitespace-nowrap">
                        Explore <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
