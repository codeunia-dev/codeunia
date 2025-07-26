"use client"
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  Mail,
  CheckCircle,
  Calendar,
  Info,
  ShoppingCart,
  XCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function RefundPolicyPage() {
  const lastUpdated = "July 27, 2025"
  
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: Info,
      content: [
        {
          subtitle: "",
          description: "Thank you for engaging with BuildUnia's offerings. We strive to ensure that our users have a rewarding experience while they discover, assess, and purchase our projects and services.",
          bullets: []
        },
        {
          subtitle: "",
          description: "As with any online purchase experience, there are terms and conditions that govern the Pricing and Refund Policy. When you purchase a project or service on BuildUnia (a product of Codeunia, a sole proprietorship registered in India under the ownership of Deepak), you agree to our Privacy Policy, Terms and Conditions, and this Pricing Policy & Refund Policy.",
          bullets: []
        }
      ]
    },
    {
      id: "pricing-policy",
      title: "Pricing Policy",
      icon: ShoppingCart,
      content: [
        {
          subtitle: "",
          description: "",
          bullets: [
            "Customized pricing is provided for each service or project, reflecting effort, complexity, and value.",
            "Price range: INR 49/- to INR 50,000/- depending on the nature and scope of the project or session.",
            "Payment schedules or durations are specified in the service/project description if applicable.",
            "We are committed to competitive pricing and accuracy. If a pricing error occurs, your order may be cancelled and you will be notified.",
            "Shopping cart prices reflect current product page prices and may change without notice.",
            "All services and projects are for personal use only, not for resale. We may refuse sales to suspected resellers."
          ]
        }
      ]
    },
    {
      id: "refund-policy",
      title: "Refund Policy",
      icon: XCircle,
      content: [
        {
          subtitle: "All Sales Are Final",
          description: "All sales on BuildUnia (for software projects, hardware projects) and for mentoring sessions are final.",
          bullets: [
            "No refunds, exchanges, or credits are provided once a purchase or payment is completed.",
            "This policy applies under all circumstances, including but not limited to:",
            "- Dissatisfaction with the purchased software project, hardware project, or mentoring session",
            "- Change of mind after purchase",
            "- Technical issues on the user's end (e.g., incompatible software, lack of necessary skills, connectivity issues during a mentoring session)",
            "- Misinterpretation of project descriptions, features, mentor profiles, or session details",
            "- Non-attendance or missed mentoring sessions"
          ]
        }
      ]
    },
    {
      id: "before-you-purchase",
      title: "Before You Purchase",
      icon: CheckCircle,
      content: [
        {
          subtitle: "",
          description: "Carefully review project descriptions, previews, documentation, and mentor profiles before making a purchase or booking a session. Contact the relevant seller/mentor (or Codeunia) for clarification before completing your transaction.",
          bullets: []
        },
        {
          subtitle: "",
          description: "By completing a purchase or booking a session, you confirm that you have read, understood, and agreed to this Refund Policy.",
          bullets: []
        }
      ]
    },
    {
      id: "contact",
      title: "Contact Us",
      icon: Mail,
      content: [
        {
          subtitle: "",
          description: "If you have any questions about this Pricing Policy & Refund Policy, please contact us:",
          bullets: [
            "Email: <a href=\"mailto:connect@codeunia.com\" className=\"text-blue-500 hover:underline\">connect@codeunia.com</a>",
            "Website: <a href=\"https://codeunia.com\" className=\"text-blue-500 hover:underline\" target=\"_blank\" rel=\"noopener noreferrer\">codeunia.com</a>"
          ]
        },
        {
          subtitle: "",
          description: "<span className=\"text-sm text-muted-foreground\">Note: This Pricing Policy & Refund Policy constitutes a legally binding agreement between you and Codeunia regarding your purchases on BuildUnia. By making a purchase, you acknowledge that you have read, understood, and agreed to these terms.</span>",
          bullets: []
        }
      ]
    }
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
                    <span>Pricing & Refund</span>
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
              Pricing & {" "}
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
                Refund Policy
              </motion.span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              Please review our pricing and refund policies carefully before making a purchase on BuildUnia.
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
                          {item.subtitle && (
                            <h4 className="text-lg font-semibold text-primary">{item.subtitle}</h4>
                          )}
                          {item.description && (
                            <div 
                              className="text-muted-foreground leading-relaxed" 
                              dangerouslySetInnerHTML={{ __html: item.description }} 
                            />
                          )}
                          {item.bullets && item.bullets.length > 0 && (
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                              {item.bullets.map((bullet, bulletIndex) => (
                                <li 
                                  key={bulletIndex} 
                                  className="leading-relaxed" 
                                  dangerouslySetInnerHTML={{ __html: bullet }} 
                                />
                              ))}
                            </ul>
                          )}
                          {itemIndex < section.content.length - 1 && <Separator className="my-4" />}
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container px-4 mx-auto">
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
                    <span>Need Help?</span>
                  </div>
                  <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                </button>
              </div>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold tracking-tight"
            >
              Still have questions?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Our support team is here to help you with any questions about our pricing or refund policies.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Button size="lg" className="gap-2" asChild>
                <Link href="/contact">
                  <Mail className="h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link href="/faq">
                  <Info className="h-4 w-4" />
                  Visit FAQ
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}