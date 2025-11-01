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
      <div className="container px-4 pl-8 md:pl-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* codeunia branding */}
          <div className="space-y-6">
            <CodeuniaLogo size="lg" showText={true} instanceId="footer" />
            <p className="text-foreground/80 leading-relaxed">
              Empowering the next generation of coders through real-world projects, vibrant community, and continuous
              learning.
            </p>
            <div className="flex items-center space-x-4">
              <Link
                href="https://github.com/Codeunia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg hover:shadow-primary/20"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.instagram.com/codeunia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg hover:shadow-primary/20"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://x.com/codeunia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg hover:shadow-primary/20"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/codeunia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-blue-700 to-blue-800 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg hover:shadow-primary/20"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* quick links of codeunia */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-foreground">Quick Links</h4>
            <div className="space-y-3">
              <Link
                href="/about"
                className="block text-foreground/80 hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
              >
                About Us
              </Link>
              <Link
                href="/hackathons"
                className="block text-foreground/80 hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
              >
                Events & Hackathons
              </Link>
              <Link
                href="/blog"
                className="block text-foreground/80 hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
              >
                Developer Blog
              </Link>
              <Link
                href="/contact"
                className="block text-foreground/80 hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
              >
                Contact Support
              </Link>
            </div>
          </div>

          {/* community section of codeunia */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-foreground">Community</h4>
            <div className="space-y-3">
              <Link
                href="https://github.com/Codeunia"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-foreground/80 hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
              >
                GitHub Projects
              </Link>
              <Link
                href="https://discord.gg/Mhn3tXnJ"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-foreground/80 hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
              >
                Discord Server
              </Link>
              <Link
                href="https://x.com/codeunia"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-foreground/80 hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
              >
                Twitter Community
              </Link>
              <Link
                href="https://www.linkedin.com/company/codeunia"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-foreground/80 hover:text-primary transition-colors hover:translate-x-1 transform duration-200"
              >
                LinkedIn Network
              </Link>
            </div>
          </div>

          {/* codeunia newsletter */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-foreground">Stay Updated</h4>
            <p className="text-foreground/80">
              Get the latest updates on events, new features, and community highlights.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading" || status === "success"}
                  className="flex-1 bg-background/50 border-border/50 focus:border-primary/50"
                  required
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={status === "loading" || status === "success"}
                  className="bg-primary/90 hover:bg-primary shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-foreground/80">
            © {new Date().getFullYear()} Codeunia. All rights reserved. Built with ❤️ for developers.
          </p>
          <div className="flex items-center space-x-6 text-sm text-foreground/80">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/refund" className="hover:text-primary transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}