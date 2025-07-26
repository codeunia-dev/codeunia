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
  const lastUpdated = "July 27, 2025"
  // Define content structure with potential bullet points
  const sections = [
    {
      id: "accounts",
      title: "Accounts",
      icon: Users,
      content: [
        {
          subtitle: "Account Creation",
          description:
            "You need an account for most activities on the Platform. You must be at least 13 years old (or older if required by your jurisdiction) to create an account. If you are not of age, please use a parent or guardian's assistance. Provide true, correct, accurate, and complete information. Do not share your account details with others.",
          bullets: [
            "You need an account for most activities on the Platform.",
            "You must be at least 13 years old (or older if required by your jurisdiction) to create an account. If you are not of age, please use a parent or guardian's assistance.",
            "Provide true, correct, accurate, and complete information.",
            "Do not share your account details with others."
          ]
        },
        {
          subtitle: "Linked Accounts",
          description:
            "When you register for Codeunia, you are automatically registered for BuildUnia, and vice versa. Your account and data are linked across both platforms.",
          bullets: [
            "When you register for Codeunia, you are automatically registered for BuildUnia, and vice versa.",
            "Your account and data are linked across both platforms."
          ]
        },
        {
          subtitle: "Account Issues",
          description:
            "Contact connect@codeunia.com for account issues or termination.",
          bullets: [
            "Contact <Link href=\"mailto:connect@codeunia.com\" className=\"text-blue-500 hover:underline\">connect@codeunia.com</Link> for account issues or termination."
          ]
        },
      ],
    },
    {
      id: "user-conduct",
      title: "User Conduct and Behavior",
      icon: Code,
      content: [
        {
          subtitle: "Conduct Guidelines",
          description:
            "Participate sincerely and do not engage in unethical, corrupt, or illegal practices. Do not harass, defame, or create disharmony among users or third parties. Do not post or transmit phishing, spam, or attempts to obtain personal information. Do not tamper with, reverse engineer, or attempt to access non-public areas of the Platform. Do not use bots, scrapers, or other automated means to access the Platform.",
          bullets: [
            "Participate sincerely and do not engage in unethical, corrupt, or illegal practices.",
            "Do not harass, defame, or create disharmony among users or third parties.",
            "Do not post or transmit phishing, spam, or attempts to obtain personal information.",
            "Do not tamper with, reverse engineer, or attempt to access non-public areas of the Platform.",
            "Do not use bots, scrapers, or other automated means to access the Platform."
          ]
        },
      ],
    },
    {
      id: "content",
      title: "Content and Services",
      icon: BookOpen,
      content: [
        {
          subtitle: "Personal Use",
          description:
            "Access to content, courses, and mentoring is for your personal, non-commercial use only. You are granted a limited, non-exclusive, non-transferable license to use the Services. Do not resell, distribute, or make available any content or courses to third parties. We may revoke access or modify services at any time for legal or policy reasons.",
          bullets: [
            "Access to content, courses, and mentoring is for your personal, non-commercial use only.",
            "You are granted a limited, non-exclusive, non-transferable license to use the Services.",
            "Do not resell, distribute, or make available any content or courses to third parties.",
            "We may revoke access or modify services at any time for legal or policy reasons."
          ]
        },
      ],
    },
    {
      id: "payments",
      title: "Payments, Credits, and Refunds",
      icon: Scale,
      content: [
        {
          subtitle: "Payment Policies",
          description:
          "Prices are displayed on the Platform and may vary. Payment is required for access to paid services. All sales on BuildUnia (for software projects, hardware projects) and for mentoring sessions are final. No refunds, exchanges, or credits are provided. Review all project and mentor details before purchase. Contact us for clarification before buying.",
          bullets: [
            "Prices are displayed on the Platform and may vary.",
            "Payment is required for access to paid services.",
            "All sales on BuildUnia (for software projects, hardware projects) and for mentoring sessions are final.",
            "No refunds, exchanges, or credits are provided.",
            "Review all project and mentor details before purchase.",
            "Contact us for clarification before buying."
          ]
        },
      ],
    },
    {
      id: "rights",
      title: "Codeunia's Rights to Content You Post",
      icon: Lock,
      content: [
        {
          subtitle: "Content License",
          description:
          "You retain ownership of content you post, but grant Codeunia a license to use, reproduce, and display it as needed for the Services. We may remove any content that violates these Terms at our discretion.",
          bullets: [
            "You retain ownership of content you post, but grant Codeunia a license to use, reproduce, and display it as needed for the Services.",
            "We may remove any content that violates these Terms at our discretion."
          ]
        },
      ],
    },
    {
      id: "risk",
      title: "Using the Platform at Your Own Risk",
      icon: AlertTriangle,
      content: [
        {
          subtitle: "Service Disclaimer",
          description:
          "All services are provided 'as-is' without warranty or guarantee. Be prudent in your interactions and do not share sensitive information with mentors or support officers. We are not liable for disputes, claims, or losses arising from user or mentor conduct. We are not responsible for third-party websites or services linked from the Platform.",
          bullets: [
            "All services are provided 'as-is' without warranty or guarantee.",
            "Be prudent in your interactions and do not share sensitive information with mentors or support officers.",
            "We are not liable for disputes, claims, or losses arising from user or mentor conduct.",
            "We are not responsible for third-party websites or services linked from the Platform."
          ]
        },
      ],
    },
    {
      id: "our-role",
      title: "Our Role",
      icon: CheckCircle,
      content: [
        {
          subtitle: "Platform Description",
          description:
          "Codeunia is not a registered or accredited educational institution. Any recognition or credential is at Codeunia's discretion and not equivalent to a formal degree or certificate. No guarantee of admission, job, or remunerative opportunity is provided.",
          bullets: [
            "Codeunia is not a registered or accredited educational institution.",
            "Any recognition or credential is at Codeunia's discretion and not equivalent to a formal degree or certificate.",
            "No guarantee of admission, job, or remunerative opportunity is provided."
          ]
        },
      ],
    },
    {
      id: "events",
      title: "Events and Activities",
      icon: Calendar,
      content: [
        {
          subtitle: "Event Participation",
          description:
          "Third-party events are not the responsibility of Codeunia. Participate at your own risk. Codeunia-organized events may be cancelled, postponed, or modified at any time.",
          bullets: [
            "Third-party events are not the responsibility of Codeunia. Participate at your own risk.",
            "Codeunia-organized events may be cancelled, postponed, or modified at any time."
          ]
        },
      ],
    },
    {
      id: "sales",
      title: "BuildUnia Specifics (Products and Sales)",
      icon: FileText,
      content: [
        {
          subtitle: "Sales Terms",
          description:
          "All transactions are subject to these Terms and any specific terms at the point of sale. Sellers are responsible for accurate listings and timely delivery. Buyers must review details and pay promptly. Disputes between users are not the responsibility of Codeunia. Disputes with Codeunia as seller will be handled by Codeunia.",
          bullets: [
            "All transactions are subject to these Terms and any specific terms at the point of sale.",
            "Sellers are responsible for accurate listings and timely delivery.",
            "Buyers must review details and pay promptly.",
            "Disputes between users are not the responsibility of Codeunia.",
            "Disputes with Codeunia as seller will be handled by Codeunia."
          ]
        },
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: BookOpen,
      content: [
        {
          subtitle: "IP Ownership",
          description:
          "All original content, features, and functionality are the exclusive property of Codeunia and its licensors. Trademarks and trade dress may not be used without written consent.",
          bullets: [
            "All original content, features, and functionality are the exclusive property of Codeunia and its licensors.",
            "Trademarks and trade dress may not be used without written consent."
          ]
        },
      ],
    },
    {
      id: "termination",
      title: "Termination and Suspension",
      icon: Lock,
      content: [
        {
          subtitle: "Termination Rights",
          description:
          "We may terminate or suspend your account immediately for any reason, including violation of these Terms. Upon termination, your right to use the Service ceases immediately.",
          bullets: [
            "We may terminate or suspend your account immediately for any reason, including violation of these Terms.",
            "Upon termination, your right to use the Service ceases immediately."
          ]
        },
      ],
    },
    {
      id: "indemnification",
      title: "Indemnification",
      icon: Shield,
      content: [
        {
          subtitle: "Your Responsibilities",
          description:
          "You agree to defend, indemnify, and hold harmless Codeunia and its owner, Deepak, from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.",
          bullets: [
            "You agree to defend, indemnify, and hold harmless Codeunia and its owner, Deepak, from any claims, damages, or expenses arising from your use of the Service or violation of these Terms."
          ]
        },
      ],
    },
    {
      id: "liability-limitation",
      title: "Limitation of Liability",
      icon: AlertTriangle,
      content: [
        {
          subtitle: "Liability Cap",
          description:
          "Our liability is limited. We are not liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill. Use the Service at your own risk.",
          bullets: [
            "Our liability is limited.",
            "We are not liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill.",
            "Use the Service at your own risk."
          ]
        },
      ],
    },
    {
      id: "warranties",
      title: "Disclaimer of Warranties",
      icon: AlertTriangle,
      content: [
        {
          subtitle: "No Warranties",
          description:
          "The Service is provided 'as is' and 'as available' without warranties of any kind. We do not guarantee uninterrupted, secure, or error-free service.",
          bullets: [
            "The Service is provided 'as is' and 'as available' without warranties of any kind.",
            "We do not guarantee uninterrupted, secure, or error-free service."
          ]
        },
      ],
    },
    {
      id: "governing-law",
      title: "Governing Law and Dispute Resolution",
      icon: Scale,
      content: [
        {
          subtitle: "Applicable Law",
          description:
          "These Terms are governed by the laws of India. Disputes are subject to the courts of Mohali.",
          bullets: [
            "These Terms are governed by the laws of India.",
            "Disputes are subject to the courts of Mohali."
          ]
        },
      ],
    },
    {
      id: "terms-changes",
      title: "Changes to These Terms",
      icon: Mail,
      content: [
        {
          subtitle: "Update Rights",
          description:
          "We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.",
          bullets: [
            "We may modify these Terms at any time.",
            "Continued use of the Service after changes constitutes acceptance of the new Terms."
          ]
        },
      ],
    },
    {
      id: "miscellaneous",
      title: "Miscellaneous Terms",
      icon: FileText,
      content: [
        {
          subtitle: "General Provisions",
          description:
          "You agree to receive communications from Codeunia regarding your use of Services. You are responsible for your interactions with other members. Codeunia may monitor disputes but is not obligated to do so. Use of the Services is also governed by our Privacy Policy. These Terms may not be transferred by you, but may be assigned by Codeunia.",
          bullets: [
            "You agree to receive communications from Codeunia regarding your use of Services.",
            "You are responsible for your interactions with other members.",
            "Codeunia may monitor disputes but is not obligated to do so.",
            "Use of the Services is also governed by our Privacy Policy.",
            "These Terms may not be transferred by you, but may be assigned by Codeunia."
          ]
        },
      ],
    },
    {
      id: "complaints",
      title: "Mechanism for Complaints",
      icon: Mail,
      content: [
        {
          subtitle: "Grievance Handling",
          description:
          "For any transaction or attempted transaction in violation of these Terms, or for any queries or concerns, contact our grievance officer: Email: connect@codeunia.com",
          bullets: [
            "For any transaction or attempted transaction in violation of these Terms, or for any queries or concerns, contact our grievance officer:",
            "Email: <Link href=\"mailto:connect@codeunia.com\" className=\"text-blue-500 hover:underline\">connect@codeunia.com</Link>"
          ]
        },
      ],
    },
    {
      id: "contact",
      title: "Contact Us",
      icon: Mail,
      content: [
        {
          subtitle: "Support Contact",
          description:
          "If you have any questions about these Terms, please contact us: Email: connect@codeunia.com Website: codeunia.com",
          bullets: [
            "If you have any questions about these Terms, please contact us:",
            "Email: <Link href=\"mailto:connect@codeunia.com\" className=\"text-blue-500 hover:underline\">connect@codeunia.com</Link>",
            "Website: <Link href=\"https://codeunia.com\" className=\"text-blue-500 hover:underline\">codeunia.com</Link>"
          ]
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
      {/* Intro Paragraph Section (Replaces Terms at a Glance) */}
      <section className="py-12 bg-gradient-to-b from-muted/30 to-background">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 via-background to-purple-500/5 dark:from-primary/10 dark:via-background dark:to-purple-500/10 hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground leading-relaxed">
                    The Codeunia services, including its community platform, courses, content, mentoring services, events, training platforms, and products such as BuildUnia (collectively, the &quot;Service&quot;), are provided through our website <a href="https://codeunia.com" className="text-blue-500 hover:underline">https://codeunia.com</a> (and its subdomains like <a href="https://buildunia.codeunia.com" className="text-blue-500 hover:underline">https://buildunia.codeunia.com</a>), and applications (collectively, the &quot;Platform&quot;), operated by Codeunia, a sole proprietorship registered in India under the ownership of Deepak (&quot;us,&quot; &quot;we,&quot; or &quot;the Company&quot;). By accessing or using our Platform or using our Services, you signify that you have read, understood, and agree to be bound by these Terms.
                  </p>
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
                          {/* Conditionally render description or bullet list */}
                          {item.bullets && item.bullets.length > 0 ? (
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                              {item.bullets.map((bullet, bulletIndex) => (
                                // Using dangerouslySetInnerHTML to allow HTML like links in bullet points
                                <li key={bulletIndex} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: bullet }} />
                              ))}
                            </ul>
                          ) : (
                            <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                          )}
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
                    <span>Get in Touch</span>
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