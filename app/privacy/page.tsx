"use client"

import Footer from "@/components/footer";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  Shield,
  Eye,
  Lock,
  Database,
  Users,
  Globe,
  Mail,
  Cookie,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { motion } from "framer-motion"

export default function PrivacyPolicyPage() {
  const lastUpdated = "June 7, 2025"

const sections = [
  {
    id: "information-collection",
    title: "Information We Collect",
    icon: Database,
    content: [
      {
        subtitle: "Personal Information",
        description:
          "When you create an account, we collect your name, email address, username, and any profile information you choose to provide.",
      },
      {
        subtitle: "Usage Data",
        description:
          "We automatically collect information about how you use our platform, including pages visited, features used, and interaction patterns.",
      },
      {
        subtitle: "Device Information",
        description:
          "We collect information about the device and browser you use to access Codeunia, such as your IP address, browser type, and operating system.",
      },
      {
        subtitle: "Project Data",
        description:
          "We collect data about the projects you create, contribute to, or interact with on our platform, including code repositories and collaboration data.",
      },
    ],
  },
  {
    id: "information-use",
    title: "How We Use Your Information",
    icon: Eye,
    content: [
      {
        subtitle: "Platform Services",
        description:
          "To provide, maintain, and improve our platform, including hackathon hosting, developer tools, and community features.",
      },
      {
        subtitle: "Communication",
        description:
          "To send you essential updates, service notifications, or community announcements related to your account or participation.",
      },
      {
        subtitle: "Personalization",
        description:
          "To personalize your experience, suggest resources, and recommend opportunities based on your preferences and activity.",
      },
      {
        subtitle: "Security & Compliance",
        description:
          "To ensure the safety and integrity of our platform, prevent fraud, and comply with applicable Indian laws.",
      },
    ],
  },
  {
    id: "information-sharing",
    title: "Information Sharing",
    icon: Users,
    content: [
      {
        subtitle: "Public Information",
        description:
          "Information such as your username, public projects, and contributions may be visible to other users to enable collaboration.",
      },
      {
        subtitle: "Service Providers",
        description:
          "We may share data with third-party service providers (e.g., hosting, analytics) who assist in running our platform under confidentiality agreements.",
      },
      {
        subtitle: "Legal Disclosures",
        description:
          "We may disclose information if required under Indian law or if necessary to comply with a legal obligation or protect our rights and users.",
      },
      {
        subtitle: "Business Changes",
        description:
          "In case of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction in accordance with applicable law.",
      },
    ],
  },
  {
    id: "data-security",
    title: "Data Security",
    icon: Lock,
    content: [
      {
        subtitle: "Encryption",
        description:
          "We use standard encryption protocols to safeguard your data both during transmission and storage.",
      },
      {
        subtitle: "Access Controls",
        description:
          "Access to your data is restricted to authorized personnel only, with authentication and role-based controls.",
      },
      {
        subtitle: "Audits & Monitoring",
        description:
          "We regularly assess our systems to identify and fix potential vulnerabilities and improve platform security.",
      },
      {
        subtitle: "Incident Management",
        description:
          "We maintain procedures to promptly respond to security incidents or breaches, and will notify affected users as required by law.",
      },
    ],
  },
  {
    id: "cookies-tracking",
    title: "Cookies & Tracking",
    icon: Cookie,
    content: [
      {
        subtitle: "Essential Cookies",
        description:
          "These are necessary to provide platform functionality, remember your login status, and maintain session integrity.",
      },
      {
        subtitle: "Analytics Cookies",
        description:
          "We use analytics cookies to understand user behavior and improve our services. These do not collect personally identifiable information.",
      },
      {
        subtitle: "Third-Party Cookies",
        description:
          "Some external services may place their own cookies. You can control these via your browser settings.",
      },
      {
        subtitle: "Managing Cookies",
        description:
          "Most browsers allow you to manage cookies. Disabling cookies may impact your experience using our services.",
      },
    ],
  },
  {
    id: "user-rights",
    title: "Your Rights",
    icon: Shield,
    content: [
      {
        subtitle: "Access & Portability",
        description:
          "You can request access to the personal data we hold about you, and obtain a copy in a commonly used format.",
      },
      {
        subtitle: "Correction",
        description:
          "You may request corrections or updates to your personal data if it is inaccurate or incomplete.",
      },
      {
        subtitle: "Deletion",
        description:
          "You may request deletion of your data, subject to legal and legitimate business requirements under Indian law.",
      },
      {
        subtitle: "Consent Withdrawal",
        description:
          "Where data processing is based on consent, you may withdraw it at any time through your account or by contacting us.",
      },
    ],
  },
];

  return (
      <div className="flex flex-col overflow-hidden">
         <Header />
          {/* hero*/}
          <section className="py-20 md:py-32 relative overflow-hidden">
              {/* grid bg from acertinityui */}
              <div
                  className={cn(
                      "absolute inset-0",
                      "[background-size:20px_20px]",
                      "[background-image:linear-gradient(to_right,rgba(99,102,241,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.8)_1px,transparent_1px)]",
                      "dark:[background-image:linear-gradient(to_right,rgba(139,92,246,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.8)_1px,transparent_1px)]"
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
                                      <span>Privacy Policy</span>
                                      <span>
                                          <Shield className="w-3 h-3" />
                                      </span>{" "}
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
                          Privacy{" "}
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
                              Policy
                          </motion.span>
                      </motion.h1>
                      <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                      >
                          Your privacy is important to us. Learn how we collect,
                          use, and protect your information on Codeunia.
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

          {/* privacy at a glance section */}
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
                                      <CardTitle className="text-2xl">
                                          Privacy at a Glance
                                      </CardTitle>
                                  </div>
                              </CardHeader>
                              <CardContent>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          transition={{
                                              duration: 0.5,
                                              delay: 0.1,
                                          }}
                                          viewport={{ once: true }}
                                          className="text-center space-y-2 hover:scale-105 transition-transform duration-300"
                                      >
                                          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto">
                                              <Lock className="h-8 w-8 text-white" />
                                          </div>
                                          <h3 className="font-semibold">
                                              Secure by Design
                                          </h3>
                                          <p className="text-sm text-muted-foreground">
                                              We use industry-standard
                                              encryption and security measures
                                              to protect your data.
                                          </p>
                                      </motion.div>
                                      <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          transition={{
                                              duration: 0.5,
                                              delay: 0.2,
                                          }}
                                          viewport={{ once: true }}
                                          className="text-center space-y-2 hover:scale-105 transition-transform duration-300"
                                      >
                                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                                              <Eye className="h-8 w-8 text-white" />
                                          </div>
                                          <h3 className="font-semibold">
                                              Transparent Practices
                                          </h3>
                                          <p className="text-sm text-muted-foreground">
                                              We&apos;re clear about what data
                                              we collect and how we use it for
                                              platform improvement.
                                          </p>
                                      </motion.div>
                                      <motion.div
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          transition={{
                                              duration: 0.5,
                                              delay: 0.3,
                                          }}
                                          viewport={{ once: true }}
                                          className="text-center space-y-2 hover:scale-105 transition-transform duration-300"
                                      >
                                          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto">
                                              <Shield className="h-8 w-8 text-white" />
                                          </div>
                                          <h3 className="font-semibold">
                                              Your Control
                                          </h3>
                                          <p className="text-sm text-muted-foreground">
                                              You have full control over your
                                              data with options to access,
                                              update, or delete it.
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
                                              <CardTitle className="text-2xl">
                                                  {section.title}
                                              </CardTitle>
                                              <p className="text-sm text-muted-foreground">
                                                  Section {index + 1}
                                              </p>
                                          </div>
                                      </div>
                                  </CardHeader>
                                  <CardContent>
                                      <div className="space-y-6">
                                          {section.content.map(
                                              (item, itemIndex) => (
                                                  <motion.div
                                                      key={itemIndex}
                                                      initial={{
                                                          opacity: 0,
                                                          x: -20,
                                                      }}
                                                      whileInView={{
                                                          opacity: 1,
                                                          x: 0,
                                                      }}
                                                      transition={{
                                                          duration: 0.5,
                                                          delay:
                                                              itemIndex * 0.1,
                                                      }}
                                                      viewport={{ once: true }}
                                                      className="space-y-2"
                                                  >
                                                      <h4 className="text-lg font-semibold text-primary">
                                                          {item.subtitle}
                                                      </h4>
                                                      <p className="text-muted-foreground leading-relaxed">
                                                          {item.description}
                                                      </p>
                                                      {itemIndex <
                                                          section.content
                                                              .length -
                                                              1 && (
                                                          <Separator className="mt-4" />
                                                      )}
                                                  </motion.div>
                                              )
                                          )}
                                      </div>
                                  </CardContent>
                              </Card>
                          </motion.div>
                      ))}
                  </div>
              </div>
          </section>

          {/* compliances*/}
          <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
              <div className="container px-4 mx-auto">
                  <div className="max-w-4xl mx-auto">
                      <div className="text-center space-y-6 mb-12">
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
                                          <span>
                                              🌍 Global & Local Compliance
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
                              Compliant with{" "}
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
                                  International Standards
                              </motion.span>
                          </motion.h1>
                          <p className="text-xl text-muted-foreground">
                              We comply with privacy laws worldwide — including
                              Europe, California, and India — to protect our
                              global and Indian users.
                          </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          <Card className="border-0 shadow-lg card-hover bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                              <CardHeader>
                                  <div className="flex items-center space-x-3">
                                      <Globe className="h-8 w-8 text-primary" />
                                      <CardTitle className="text-xl">
                                          GDPR Compliance
                                      </CardTitle>
                                  </div>
                              </CardHeader>
                              <CardContent>
                                  <p className="text-muted-foreground leading-relaxed">
                                      We comply with the European Union&apos;s
                                      General Data Protection Regulation (GDPR),
                                      protecting data rights such as
                                      portability, erasure, and explicit
                                      consent.
                                  </p>
                              </CardContent>
                          </Card>

                          <Card className="border-0 shadow-lg card-hover bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                              <CardHeader>
                                  <div className="flex items-center space-x-3">
                                      <Shield className="h-8 w-8 text-primary" />
                                      <CardTitle className="text-xl">
                                          CCPA Compliance
                                      </CardTitle>
                                  </div>
                              </CardHeader>
                              <CardContent>
                                  <p className="text-muted-foreground leading-relaxed">
                                      We respect California residents&apos;
                                      rights under the CCPA, including the right
                                      to know, delete, and opt out of the sale
                                      of personal data.
                                  </p>
                              </CardContent>
                          </Card>

                          <Card className="border-0 shadow-lg card-hover bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
                              <CardHeader>
                                  <div className="flex items-center space-x-3">
                                      <Shield className="h-8 w-8 text-primary" />
                                      <CardTitle className="text-xl">
                                          DPDPA Compliance
                                      </CardTitle>
                                  </div>
                              </CardHeader>
                              <CardContent>
                                  <p className="text-muted-foreground leading-relaxed">
                                      As an Indian platform, we follow the
                                      Digital Personal Data Protection Act,
                                      2023, giving users transparency,
                                      consent-based processing, and the right to
                                      correct or delete their data.
                                  </p>
                              </CardContent>
                          </Card>
                      </div>
                  </div>
              </div>
          </section>

          {/* data retention section*/}
          <section className="py-20">
              <div className="container px-4 mx-auto">
                  <div className="max-w-4xl mx-auto">
                      <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-background to-purple-500/10 dark:from-primary/20 dark:via-background dark:to-purple-500/20 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
                          <CardHeader>
                              <div className="flex items-center space-x-4">
                                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                                      <Database className="h-7 w-7 text-white" />
                                  </div>
                                  <div>
                                      <CardTitle className="text-2xl">
                                          Data Retention
                                      </CardTitle>
                                      <p className="text-muted-foreground">
                                          How long we keep your information
                                      </p>
                                  </div>
                              </div>
                          </CardHeader>
                          <CardContent>
                              <div className="space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-3">
                                          <h4 className="font-semibold text-primary">
                                              Account Data
                                          </h4>
                                          <p className="text-sm text-muted-foreground">
                                              We retain your account information
                                              for as long as your account is
                                              active or as needed to provide
                                              services.
                                          </p>
                                      </div>
                                      <div className="space-y-3">
                                          <h4 className="font-semibold text-primary">
                                              Project Data
                                          </h4>
                                          <p className="text-sm text-muted-foreground">
                                              Project data is retained based on
                                              your settings and may be kept for
                                              historical and backup purposes.
                                          </p>
                                      </div>
                                      <div className="space-y-3">
                                          <h4 className="font-semibold text-primary">
                                              Usage Analytics
                                          </h4>
                                          <p className="text-sm text-muted-foreground">
                                              Anonymized usage data may be
                                              retained for up to 2 years for
                                              platform improvement purposes.
                                          </p>
                                      </div>
                                      <div className="space-y-3">
                                          <h4 className="font-semibold text-primary">
                                              Communication Records
                                          </h4>
                                          <p className="text-sm text-muted-foreground">
                                              Support communications are
                                              retained for 3 years to maintain
                                              service quality and resolve
                                              issues.
                                          </p>
                                      </div>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  </div>
              </div>
          </section>

          {/* contact & updates section */}
          <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
              <div className="container px-4 mx-auto">
                  <div className="max-w-4xl mx-auto space-y-8">
                      <div className="text-center space-y-6">
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
                                  Privacy ?
                              </motion.span>
                          </motion.h1>
                          <p className="text-xl text-muted-foreground">
                              We&apos;re here to help you understand how we
                              protect your privacy.
                          </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <Card className="border-0 shadow-lg card-hover">
                              <CardHeader>
                                  <div className="flex items-center space-x-3">
                                      <Mail className="h-8 w-8 text-primary" />
                                      <CardTitle className="text-xl">
                                          Contact Our Privacy Team
                                      </CardTitle>
                                  </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                  <p className="text-muted-foreground">
                                      Have questions about this privacy policy
                                      or how we handle your data? Our privacy
                                      team is here to help.
                                  </p>
                                  <Button className="w-full glow-effect hover:scale-105 transition-all duration-300">
                                      Email Privacy Team
                                  </Button>
                              </CardContent>
                          </Card>

                          <Card className="border-0 shadow-lg card-hover">
                              <CardHeader>
                                  <div className="flex items-center space-x-3">
                                      <AlertTriangle className="h-8 w-8 text-primary" />
                                      <CardTitle className="text-xl">
                                          Report Privacy Concerns
                                      </CardTitle>
                                  </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                  <p className="text-muted-foreground">
                                      If you have concerns about how your data
                                      is being handled, please report them to us
                                      immediately.
                                  </p>
                                  <Button
                                      variant="outline"
                                      className="w-full hover:scale-105 transition-all duration-300"
                                  >
                                      Report Concern
                                  </Button>
                              </CardContent>
                          </Card>
                      </div>

                      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                          <CardHeader>
                              <div className="flex items-center space-x-3">
                                  <FileText className="h-8 w-8 text-primary" />
                                  <CardTitle className="text-xl">
                                      Policy Updates
                                  </CardTitle>
                              </div>
                          </CardHeader>
                          <CardContent>
                              <p className="text-muted-foreground leading-relaxed">
                                  We may update this privacy policy from time to
                                  time to reflect changes in our practices or
                                  for legal, operational, or regulatory reasons.
                                  We will notify you of any material changes by
                                  posting the new policy on this page and
                                  updating the &quot;Last updated&quot; date. We
                                  encourage you to review this policy
                                  periodically to stay informed about how we
                                  protect your information.
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
                      <div className="flex flex-col items-center justify-center gap-4">
                          <button className="bg-slate-800 no-underline group relative shadow-2xl shadow-zinc-900 rounded-full p-px text-sm font-semibold leading-6 text-white inline-block cursor-default">
                              <span className="absolute inset-0 overflow-hidden rounded-full">
                                  <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                              </span>
                              <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-1 px-4 ring-1 ring-white/10">
                                  <span>🔐 Your Privacy Matters</span>
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
                          Ready to Join{" "}
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
                              Codeunia?
                          </motion.span>
                      </motion.h1>
                      <p className="text-xl text-muted-foreground dark:text-muted-foreground/90 leading-relaxed">
                          Start coding with confidence knowing your privacy is
                          protected by industry-leading security measures.
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
  );
}
