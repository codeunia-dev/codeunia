"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid unsubscribe link")
      return
    }

    const unsubscribe = async () => {
      try {
        const response = await fetch("/api/newsletter/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage(data.message)
        } else {
          setStatus("error")
          setMessage(data.error)
        }
      } catch {
        setStatus("error")
        setMessage("Failed to unsubscribe. Please try again.")
      }
    }

    unsubscribe()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/95 p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
            <h1 className="text-2xl font-bold">Processing...</h1>
            <p className="text-foreground/70">Please wait while we unsubscribe you</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold">Unsubscribed Successfully</h1>
            <p className="text-foreground/70">{message}</p>
            <p className="text-sm text-foreground/60">
              You will no longer receive newsletter emails from Codeunia.
            </p>
            <Link href="/">
              <Button className="w-full">Return to Homepage</Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-16 w-16 mx-auto text-red-500" />
            <h1 className="text-2xl font-bold">Unsubscribe Failed</h1>
            <p className="text-foreground/70">{message}</p>
            <Link href="/contact">
              <Button variant="outline" className="w-full">Contact Support</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}
