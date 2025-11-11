"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Github, Twitter, Linkedin, ArrowRight, Instagram, Loader2, CheckCircle2 } from "lucide-react"
import CodeuniaLogo from "./codeunia-logo";
import { useState, FormEvent } from "react"

export default function Footer() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleNewsletterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error")
      setMessage("Please enter a valid email address")
      return
    }

    setStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Thanks for subscribing!")
        setEmail("")
        setTimeout(() => {
          setStatus("idle")
          setMessage("")
        }, 5000)
      } else {
        setStatus("error")
        setMessage(data.error || "Something went wrong. Please try again.")
      }
    } catch {
      setStatus("error")
      setMessage("Network error. Please try again.")
    }
  }
  return (
    <footer className="border-t border-border/40 bg-gradient-to-b from-background/95 via-background to-background/95">
      <div className="container px-4 sm:px-6 md:px-8 lg:pl-12 py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* codeunia branding */}
          <div className="space-y-4">
            <CodeuniaLogo size="lg" showText={true} instanceId="footer" />
            <p className="text-foreground/80 leading-relaxed text-sm">
              Empowering the next generation of coders through real-world projects, vibrant community, and continuous
              learning.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="https://github.com/Codeunia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg hover:shadow-primary/20"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.instagram.com/codeunia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg hover:shadow-primary/20"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://x.com/codeunia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg hover:shadow-primary/20"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/codeunia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-800 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg hover:shadow-primary/20"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* quick links and community - 2 column layout on mobile */}
          <div className="grid grid-cols-2 gap-8 lg:contents">
            {/* quick links of codeunia */}
            <div className="space-y-4">
              <h4 className="text-base font-bold text-foreground">Quick Links</h4>
              <nav className="space-y-2.5">
                <Link
                  href="/about"
                  className="block text-sm text-foreground/80 hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
                >
                  About Us
                </Link>
                <Link
                  href="/hackathons"
                  className="block text-sm text-foreground/80 hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
                >
                  Events & Hackathons
                </Link>
                <Link
                  href="/blog"
                  className="block text-sm text-foreground/80 hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
                >
                  Developer Blog
                </Link>
                <Link
                  href="/contact"
                  className="block text-sm text-foreground/80 hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
                >
                  Contact Support
                </Link>
              </nav>
            </div>

            {/* community section of codeunia */}
            <div className="space-y-4">
              <h4 className="text-base font-bold text-foreground">Community</h4>
              <nav className="space-y-2.5">
                <Link
                  href="https://github.com/Codeunia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-foreground/80 hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
                >
                  GitHub Projects
                </Link>
                <Link
                  href="https://discord.gg/Mhn3tXnJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-foreground/80 hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
                >
                  Discord Server
                </Link>
                <Link
                  href="https://x.com/codeunia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-foreground/80 hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
                >
                  Twitter Community
                </Link>
                <Link
                  href="https://www.linkedin.com/company/codeunia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-foreground/80 hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
                >
                  LinkedIn Network
                </Link>
              </nav>
            </div>
          </div>

          {/* codeunia newsletter */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-foreground">Stay Updated</h4>
            <p className="text-foreground/80 text-sm leading-relaxed">
              Get the latest updates on events, new features, and community highlights.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="flex flex-col xs:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading" || status === "success"}
                  className="flex-1 bg-background/50 border-border/50 focus:border-primary/50 text-sm h-10"
                  required
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={status === "loading" || status === "success"}
                  className="bg-primary/90 hover:bg-primary shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed h-10 px-4"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : status === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {message && (
                <p className={`text-xs ${status === "error" ? "text-red-500" : "text-green-500"}`}>
                  {message}
                </p>
              )}
              {!message && (
                <p className="text-xs text-foreground/70">Join 2,000+ developers in our newsletter</p>
              )}
            </form>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 pt-6 md:pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-3">
          <p className="text-xs sm:text-sm text-foreground/80 text-center sm:text-left">
            © {new Date().getFullYear()} Codeunia. All rights reserved. Built with ❤️ for developers.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-foreground/80">
            <Link href="/privacy" className="hover:text-primary transition-colors whitespace-nowrap">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors whitespace-nowrap">
              Terms of Service
            </Link>
            <Link href="/refund" className="hover:text-primary transition-colors whitespace-nowrap">
              Refund Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}