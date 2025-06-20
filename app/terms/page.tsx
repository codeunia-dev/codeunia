"use client"

import Footer from "@/components/footer";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  Scale,
  FileText,
  Users,
  Mail,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Shield,
  Lock,
  BookOpen,
  Code,
} from "lucide-react"
import { motion } from "framer-motion"

export default function TermsPage() {
  const lastUpdated = "June 8, 2025"

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: Scale,
      content: [
        {
          subtitle: "Agreement to Terms",
          description:
            "By accessing or using Codeunia, you agree to be bound by these Terms of Service and all applicable laws and regulations.",
        },
        {
          subtitle: "Changes to Terms",
          description:
            "We reserve the right to modify these terms at any time. We will notify users of any material changes via email or platform notifications.",
        },
        {
          subtitle: "Eligibility",
          description:
            "You must be at least 13 years old to use Codeunia. If you are under 18, you must have parental or guardian consent.",
        },
        {
          subtitle: "Account Responsibility",
          description:
            "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.",
        },
      ],
    },
    {
      id: "platform-usage",
      title: "Platform Usage",
      icon: Code,
      content: [
        {
          subtitle: "Acceptable Use",
          description:
            "You agree to use Codeunia only for lawful purposes and in accordance with these Terms. You will not engage in any activity that interferes with or disrupts the platform.",
        },
        {
          subtitle: "Content Guidelines",
          description:
            "All content shared on Codeunia must comply with our community guidelines. We reserve the right to remove content that violates these guidelines.",
        },
        {
          subtitle: "Project Collaboration",
          description:
            "When collaborating on projects, you must respect other users' rights and follow our collaboration guidelines.",
        },
        {
          subtitle: "Resource Usage",
          description:
            "You agree to use platform resources responsibly and not to engage in any activity that could harm the platform's performance.",
        },
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: BookOpen,
      content: [
        {
          subtitle: "User Content",
          description:
            "You retain ownership of your content, but grant Codeunia a license to use, modify, and display it for platform operation.",
        },
        {
          subtitle: "Platform Content",
          description:
            "All platform content, including code, design, and branding, is owned by Codeunia and protected by intellectual property laws.",
        },
        {
          subtitle: "Open Source",
          description:
            "Some platform features may use open-source software. You must comply with the respective open-source licenses.",
        },
        {
          subtitle: "Attribution",
          description:
            "You must properly attribute any third-party content or open-source code used in your projects.",
        },
      ],
    },
    {
      id: "user-conduct",
      title: "User Conduct",
      icon: Users,
      content: [
        {
          subtitle: "Prohibited Activities",
          description:
            "You may not engage in harassment, spamming, or any activity that violates others' rights or platform rules.",
        },
        {
          subtitle: "Community Standards",
          description:
            "You must maintain professional conduct and respect other users' rights and dignity.",
        },
        {
          subtitle: "Reporting Violations",
          description:
            "Users are encouraged to report violations of these terms. We will investigate and take appropriate action.",
        },
        {
          subtitle: "Consequences",
          description:
            "Violations may result in warnings, temporary suspension, or permanent account termination.",
        },
      ],
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      icon: Shield,
      content: [
        {
          subtitle: "Platform Availability",
          description:
            "We strive for 24/7 availability but do not guarantee uninterrupted service. We are not liable for any service interruptions.",
        },
        {
          subtitle: "User Content",
          description:
            "We are not responsible for user-generated content and do not endorse any views expressed by users.",
        },
        {
          subtitle: "Third-Party Services",
          description:
            "We are not liable for any issues arising from third-party services integrated with our platform.",
        },
        {
          subtitle: "Damages",
          description:
            "To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages.",
        },
      ],
    },
    {
      id: "termination",
      title: "Termination",
      icon: Lock,
      content: [
        {
          subtitle: "Account Termination",
          description:
            "We reserve the right to terminate or suspend accounts that violate these terms or engage in harmful activities.",
        },
        {
          subtitle: "User Termination",
          description:
            "You may terminate your account at any time by following the account deletion process.",
        },
        {
          subtitle: "Data Retention",
          description:
            "Upon termination, we may retain certain data as required by law or for legitimate business purposes.",
        },
        {
          subtitle: "Effect of Termination",
          description:
            "Termination will result in the loss of access to platform features and may affect your ability to participate in ongoing projects.",
        },
      ],
    },
  ]

  return (
    <div className="flex flex-col overflow-hidden">
        <Header />
      {/* hero */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:20px_20px]",
            "[background-image:linear-gradient(to_right,rgba(99,102,241,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.8)_1px,transparent_1px)]",
            "dark:[background-image:linear-gradient(to_right,rgba(139,92,246,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.8)_1px,transparent_1px)]",
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
                  <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-1 px-4 ring-1 ring-white/10">
                    <span>Terms & Conditions</span>
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
              Terms & {" "}
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
                Conditions
              </motion.span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              Please read these terms carefully before using Codeunia. By using our platform, you agree to these terms.
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

      {/* terms at a glance section */}
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
                    <CardTitle className="text-2xl">Terms at a Glance</CardTitle>
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
                        <Scale className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold">Clear Guidelines</h3>
                      <p className="text-sm text-muted-foreground">
                        We provide clear guidelines for using our platform and participating in our community.
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
                        <Shield className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold">User Protection</h3>
                      <p className="text-sm text-muted-foreground">
                        We protect your rights while ensuring a safe and productive environment for all users.
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
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold">IP Rights</h3>
                      <p className="text-sm text-muted-foreground">
                        Clear policies on intellectual property rights and content ownership.
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

      {/* contact section */}
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
              Questions About {" "}
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
                Terms?
              </motion.span>
            </motion.h1>
              <p className="text-xl text-muted-foreground">
                We&apos;re here to help you understand our terms of service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg card-hover">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-8 w-8 text-primary" />
                    <CardTitle className="text-xl">Contact Our Team</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Have questions about these terms or need clarification? Our team is here to help.
                  </p>
                  <Button className="w-full glow-effect hover:scale-105 transition-all duration-300">
                    Email Support
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg card-hover">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-8 w-8 text-primary" />
                    <CardTitle className="text-xl">Report Violations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    If you notice any violations of these terms, please report them to us immediately.
                  </p>
                  <Button variant="outline" className="w-full hover:scale-105 transition-all duration-300">
                    Report Issue
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <CardTitle className="text-xl">Terms Updates</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  We may update these terms from time to time to reflect changes in our services or legal requirements.
                  We will notify you of any material changes by posting the new terms on this page and updating the
                  &quot;Last updated&quot; date. We encourage you to review these terms periodically to stay informed about
                  your rights and responsibilities.
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
                    <span>📜 Ready to Get Started?</span>
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
              Join Codeunia  {" "}
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
                Today
              </motion.span>
            </motion.h1>
            <p className="text-xl text-muted-foreground dark:text-muted-foreground/90 leading-relaxed">
              Start your coding journey with a platform that values transparency and user rights.
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
