"use client"

import Footer from "@/components/footer";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Trophy,
  ArrowRight,
  Sparkles,
  Code,
} from "lucide-react"
import { motion } from "framer-motion"
import { SparklesCore } from "@/components/ui/sparkles"
import Link from "next/link"

export default function EventsPage() {
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
                <button className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block">
                  <span className="absolute inset-0 overflow-hidden rounded-full">
                    <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </span>
                  <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-1 px-4 ring-1 ring-white/10">
                    <span>Upcoming Events</span>
                    <span>
                      <Calendar className="w-3 h-3" />
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
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight px-4"
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
                style={{
                  background:
                    "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)",
                  backgroundSize: "300% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Events
              </motion.span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4"
            >
              Discover exciting hackathons, workshops, and tech events hosted by CodeUnia.
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* events section */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-purple-500/10 dark:from-primary/20 dark:via-background dark:to-purple-500/20 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center">
                        <Code className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl sm:text-2xl">RealityCode by CodeUnia</CardTitle>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                          <Badge className="bg-primary/90 text-white border-0 w-fit">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Hackathon
                          </Badge>
                          <Badge variant="outline" className="border-primary/30 w-fit">
                            <Trophy className="w-3 h-3 mr-1" />
                            ₹6,00,000 Prize Pool
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm sm:text-base">Location</p>
                          <p className="text-muted-foreground text-sm sm:text-base">Chandigarh University, Mohali, Punjab, India</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm sm:text-base">Date</p>
                          <p className="text-muted-foreground text-sm sm:text-base">December 15-17, 2024</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm sm:text-base">Duration</p>
                          <p className="text-muted-foreground text-sm sm:text-base">24 Hours</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm sm:text-base">Expected Participants</p>
                          <p className="text-muted-foreground text-sm sm:text-base">500+ Developers</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm sm:text-base">Prize Pool</p>
                          <p className="text-muted-foreground text-sm sm:text-base">₹6,00,000</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm sm:text-base">Updated On</p>
                          <p className="text-muted-foreground text-sm sm:text-base">June 15, 2025</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-border/50">
                    <p className="text-muted-foreground leading-relaxed mb-6 text-sm sm:text-base">
                      RealityCode is a 24-hour hackathon focused on AI and machine learning projects. 
                      Build innovative solutions and compete for exciting prizes while networking with 
                      fellow developers and industry experts.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                        asChild
                      >
                        <Link 
                          href="https://unstop.com/p/realitycode-by-codeunia-codeunia-1488383"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          Register Now
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-primary/30 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 w-full sm:w-auto"
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* cta Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-primary/10 via-purple-500/10 to-background dark:from-primary/20 dark:via-purple-500/20 dark:to-background">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 dark:bg-primary/30 rounded-full blur-xl animate-float"></div>
          <div
            className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500/20 dark:bg-purple-500/30 rounded-full blur-xl animate-float"
            style={{ animationDelay: "3s" }}
          ></div>
        </div>

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
            <div className="flex flex-col items-center justify-center gap-4">
              <button className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block">
                <span className="absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </span>
                <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-1 px-4 ring-1 ring-white/10">
                  <span>Stay Updated 🚀</span>
                </div>
                <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
              </button>
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight px-4"
            >
              More{" "}
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
                Events Coming Soon
              </motion.span>
            </motion.h2>
            <p className="text-xl text-muted-foreground dark:text-muted-foreground/90 leading-relaxed">
              Follow us on social media to stay updated with our latest events, workshops, and hackathons.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
              <Button
                size="lg"
                variant="default"
                className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                asChild
              >
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold hover:scale-105 transition-transform duration-300 w-full sm:w-auto"
                asChild
              >
                <Link href="/about">
                  About CodeUnia
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
      
      <Footer />
    </div>
  );
}
