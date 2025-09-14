"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

// Simple 404 messages
const funnyMessages = [
  "Oops, you've gone off the grid 🚀",
  "This page doesn't exist… yet 👨‍💻",
  "Error 404: Opportunity Not Found",
  "This page is in another branch 🌿",
  "This page is taking a coffee break ☕",
  "This route is still under development 😜",
  "Lost? Even Stack Overflow can't help you here 🤷‍♂️"
]

export default function NotFound() {
  // Pick a random message on each page load
  const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold text-primary/20 mb-6 select-none">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-primary font-medium mb-8">
            {randomMessage}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Take me Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
