"use client"

import Footer from "@/components/footer";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  Shield,
  Cookie,
  Settings,
  Eye,
  FileText,
  Calendar,
  CheckCircle,
  Lock,
  Globe,
} from "lucide-react"
import { motion } from "framer-motion"

export default function CookiesPage() {
  const lastUpdated = "June 8, 2025"

  const sections = [
    {
      id: "what-are-cookies",
      title: "What Are Cookies",
      icon: Cookie,
      content: [
        {
          subtitle: "Definition",
          description:
            "Cookies are small text files that are placed on your device when you visit Codeunia. They help us provide you with a better experience and enable certain features to work properly.",
        },
        {
          subtitle: "Purpose",
          description:
            "We use cookies to remember your preferences, understand how you use our platform, and improve your experience. They help us make Codeunia more user-friendly and efficient.",
        },
        {
          subtitle: "Types of Cookies",
          description:
            "We use different types of cookies: essential cookies for platform functionality, preference cookies for your settings, and analytics cookies to improve our services.",
        },
        {
          subtitle: "Cookie Lifespan",
          description:
            "Some cookies are temporary and are deleted when you close your browser, while others remain on your device for a longer period to remember your preferences.",
        },
      ],
    },
    {
      id: "how-we-use-cookies",
      title: "How We Use Cookies",
      icon: Settings,
      content: [
        {
          subtitle: "Essential Cookies",
          description:
            "These cookies are necessary for the platform to function properly. They enable basic features like security, network management, and accessibility.",
        },
        {
          subtitle: "Preference Cookies",
          description:
            "These cookies remember your settings and preferences, such as language choice, theme selection, and notification preferences.",
        },
        {
          subtitle: "Analytics Cookies",
          description:
            "We use these cookies to understand how users interact with our platform, which helps us improve our services and user experience.",
        },
        {
          subtitle: "Learning Experience",
          description:
            "Cookies help us personalize your learning journey by remembering your progress, preferences, and interaction patterns.",
        },
      ],
    },
    {
      id: "third-party-cookies",
      title: "Third-Party Cookies",
      icon: Globe,
      content: [
        {
          subtitle: "Analytics Services",
          description:
            "We use trusted third-party services like Google Analytics to understand how our platform is used and to improve our services.",
        },
        {
          subtitle: "Social Media",
          description:
            "When you interact with social media features on our platform, these services may set their own cookies on your device.",
        },
        {
          subtitle: "Learning Tools",
          description:
            "Some of our learning tools and integrations may use cookies to provide enhanced functionality and features.",
        },
        {
          subtitle: "Advertising",
          description:
            "We may use cookies to show you relevant educational content and opportunities that match your interests and learning goals.",
        },
      ],
    },
    {
      id: "cookie-controls",
      title: "Cookie Controls",
      icon: Lock,
      content: [
        {
          subtitle: "Browser Settings",
          description:
            "You can control cookies through your browser settings. Most browsers allow you to block or delete cookies, though this may affect platform functionality.",
        },
        {
          subtitle: "Cookie Preferences",
          description:
            "You can manage your cookie preferences through our platform settings, choosing which types of cookies you want to accept.",
        },
        {
          subtitle: "Opting Out",
          description:
            "You can opt out of non-essential cookies while still maintaining access to core platform features and functionality.",
        },
        {
          subtitle: "Updates to Preferences",
          description:
            "You can update your cookie preferences at any time through your account settings or by clearing your browser cookies.",
        },
      ],
    },
    {
      id: "data-protection",
      title: "Data Protection",
      icon: Shield,
      content: [
        {
          subtitle: "Security Measures",
          description:
            "We implement appropriate security measures to protect the data collected through cookies from unauthorized access or disclosure.",
        },
        {
          subtitle: "Data Retention",
          description:
            "We only retain cookie data for as long as necessary to fulfill the purposes for which it was collected.",
        },
        {
          subtitle: "Data Sharing",
          description:
            "We do not sell cookie data to third parties. Data collected through cookies is used only for the purposes described in this policy.",
        },
        {
          subtitle: "Privacy Rights",
          description:
            "You have the right to access, correct, or delete your personal data collected through cookies, subject to legal requirements.",
        },
      ],
    },
    {
      id: "updates",
      title: "Policy Updates",
      icon: FileText,
      content: [
        {
          subtitle: "Changes to Policy",
          description:
            "We may update this cookie policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.",
        },
        {
          subtitle: "Notification",
          description:
            "We will notify you of any material changes to this policy by posting the new policy on this page and updating the 'Last updated' date.",
        },
        {
          subtitle: "Continued Use",
          description:
            "Your continued use of Codeunia after any changes to this policy constitutes your acceptance of the updated policy.",
        },
        {
          subtitle: "Contact",
          description:
            "If you have any questions about our cookie policy, please contact our privacy team for clarification.",
        },
      ],
    },
  ]

  return (
    <div className="flex flex-col overflow-hidden">
      {/* hero*/}
       <Header />
      <section className="py-20 md:py-32 relative overflow-hidden">
        {/* grid bg from acertinityui */}
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:20px_20px]",
            "[background-image:linear-gradient(to_right,rgba(99,102,241,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.8)_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,rgba(139,92,246,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.8)_1px,transparent_1px)]",
          )}
        />
       
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        
        {/* animated bg*/}
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
                  <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-1 px-4 ring-1 ring-white/10">
                    <span>Cookie Policy</span>
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
              Cookie{" "}
              <motion.span 
                className="gradient-text inline-block"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)",
                  backgroundSize: "300% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Policy
              </motion.span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              Learn how we use cookies to enhance your experience on Codeunia and how you can control them.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center justify-center space-x-2 text-sm text-muted-foreground"
            >
              <Calendar className="h-4 w-4" />
              <span>Last updated: {lastUpdated}</span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* cookies at a glance section */}
      <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-purple-500/10 dark:from-primary/20 dark:via-background dark:to-purple-500/20 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Cookies at a Glance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      viewport={{ once: true }}
                      className="text-center space-y-2 hover:scale-105 transition-transform duration-300"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto">
                        <Settings className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold">Essential Cookies</h3>
                      <p className="text-sm text-muted-foreground">
                        Required for platform functionality and security.
                      </p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="text-center space-y-2 hover:scale-105 transition-transform duration-300"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                        <Eye className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold">Analytics Cookies</h3>
                      <p className="text-sm text-muted-foreground">
                        Help us improve your learning experience.
                      </p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="text-center space-y-2 hover:scale-105 transition-transform duration-300"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold">Your Control</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage your cookie preferences anytime.
                      </p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* main content section */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto space-y-12">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-0 shadow-lg card-hover hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <section.icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{section.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">Section {index + 1}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {section.content.map((item, itemIndex) => (
                        <motion.div 
                          key={itemIndex} 
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: itemIndex * 0.1 }}
                          viewport={{ once: true }}
                          className="space-y-2"
                        >
                          <h4 className="text-lg font-semibold text-primary">{item.subtitle}</h4>
                          <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                          {itemIndex < section.content.length - 1 && <Separator className="mt-4" />}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* contact & updates section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-6">
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
                  <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-1 px-4 ring-1 ring-white/10">
                    <span>📞 Get in Touch</span>
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
              Questions About{" "}
              <motion.span 
                className="gradient-text inline-block"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)",
                  backgroundSize: "300% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Cookies?
              </motion.span>
            </motion.h1>
              <p className="text-xl text-muted-foreground">
                We&apos;re here to help you understand our cookie policy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg card-hover">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <CardTitle className="text-xl">Contact Privacy Team</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Have questions about our cookie policy or need clarification? Our privacy team is here to help.
                  </p>
                  <Button className="w-full glow-effect hover:scale-105 transition-all duration-300">
                    Contact Privacy Team
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg card-hover">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Settings className="h-8 w-8 text-primary" />
                    <CardTitle className="text-xl">Cookie Settings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Manage your cookie preferences and control how we use cookies on your device.
                  </p>
                  <Button variant="outline" className="w-full hover:scale-105 transition-all duration-300">
                    Manage Cookies
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <CardTitle className="text-xl">Policy Updates</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this cookie policy from time to time to reflect changes in our practices or for legal,
                  operational, or regulatory reasons. We will notify you of any material changes by posting the new
                  policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this policy
                  periodically to stay informed about how we use cookies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-primary/10 via-purple-500/10 to-background dark:from-primary/20 dark:via-purple-500/20 dark:to-background">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 dark:bg-primary/30 rounded-full blur-xl animate-float"></div>
          <div
            className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500/20 dark:bg-purple-500/30 rounded-full blur-xl animate-float"
            style={{ animationDelay: "3s" }}
          ></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="container px-4 mx-auto text-center relative z-10"
        >
          <div className="max-w-3xl mx-auto space-y-8 p-8 rounded-3xl bg-background/50 dark:bg-background/80 backdrop-blur-md border border-primary/10 dark:border-primary/20 shadow-xl">
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
                  <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-1 px-4 ring-1 ring-white/10">
                    <span>🚀 Start Your Journey</span>
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
              Ready to Join{" "}
              <motion.span 
                className="gradient-text inline-block"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)",
                  backgroundSize: "300% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Codeunia?
              </motion.span>
            </motion.h1>
            <p className="text-xl text-muted-foreground dark:text-muted-foreground/90 leading-relaxed">
              Begin your learning journey with confidence, knowing your privacy is protected.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="default"
                className="px-8 py-6 text-lg font-semibold hover:scale-105 transition-all duration-300"
              >
                Create Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg font-semibold hover:scale-105 transition-transform duration-300"
              >
                Learn More
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  )
}