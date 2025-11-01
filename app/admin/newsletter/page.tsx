"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Send, Loader2, Users, Mail } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Subscriber {
  id: number
  email: string
  status: string
  created_at: string
}

export default function NewsletterAdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, subscribed: 0, unsubscribed: 0 })
  const [error, setError] = useState("")
  
  // Newsletter sending state
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const response = await fetch("/api/admin/newsletter/subscribers")
      const data = await response.json()
      
      if (response.ok) {
        setSubscribers(data.subscribers || [])
        setStats(data.stats || { total: 0, subscribed: 0, unsubscribed: 0 })
      } else {
        setError(data.error || "Failed to fetch subscribers")
        console.error("API Error:", data)
      }
    } catch (err) {
      console.error("Failed to fetch subscribers:", err)
      setError("Network error - check console")
    } finally {
      setLoading(false)
    }
  }

  const exportSubscribers = () => {
    const csv = [
      ["Email", "Status", "Subscribed Date"],
      ...subscribers.map(sub => [
        sub.email,
        sub.status,
        new Date(sub.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const sendNewsletter = async () => {
    if (!subject || !content) {
      alert("Please fill in both subject and content")
      return
    }

    if (!confirm(`Send newsletter to ${stats.subscribed} subscribers?`)) {
      return
    }

    setSending(true)
    try {
      const response = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Newsletter sent successfully to ${data.sent} subscribers!`)
        setSubject("")
        setContent("")
      } else {
        alert(`Failed to send newsletter: ${data.error}`)
      }
    } catch {
      alert("Failed to send newsletter")
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Subscribers</h2>
          <p className="text-foreground/70">{error}</p>
          <p className="text-sm text-foreground/50 mt-4">
            Make sure you&apos;re logged in as an admin and RLS policies are configured correctly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Management</h1>
          <p className="text-foreground/70">Manage subscribers and send newsletters</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Total Subscribers</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Active</p>
                <p className="text-3xl font-bold text-green-500">{stats.subscribed}</p>
              </div>
              <Mail className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Unsubscribed</p>
                <p className="text-3xl font-bold text-red-500">{stats.unsubscribed}</p>
              </div>
              <Mail className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        <Tabs defaultValue="subscribers" className="w-full">
          <TabsList>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="send">Send Newsletter</TabsTrigger>
          </TabsList>

          <TabsContent value="subscribers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Subscribers</h2>
              <Button onClick={exportSubscribers} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4">Email</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Subscribed Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr key={sub.id} className="border-t border-border">
                        <td className="p-4">{sub.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            sub.status === "subscribed" 
                              ? "bg-green-500/20 text-green-500" 
                              : "bg-red-500/20 text-red-500"
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="send" className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold">Compose Newsletter</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Newsletter subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={sending}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content (HTML supported)</label>
                <textarea
                  className="w-full min-h-[300px] p-3 rounded-md border border-border bg-background font-mono text-sm"
                  placeholder={`<h2 style="color: #667eea; margin-top: 0;">Welcome to Our Newsletter!</h2>
<p>Here's what's new this week:</p>
<ul style="line-height: 1.8;">
  <li><strong>New Feature:</strong> Description here</li>
  <li><strong>Upcoming Event:</strong> Details here</li>
  <li><strong>Community Highlight:</strong> Share achievements</li>
</ul>
<p>Stay tuned for more updates!</p>`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={sending}
                />
                <p className="text-xs text-foreground/60">
                  💡 Tip: Use HTML for formatting. The template includes a beautiful header, footer, and social links automatically.
                </p>
              </div>

              <Button 
                onClick={sendNewsletter} 
                disabled={sending || !subject || !content}
                className="w-full"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send to {stats.subscribed} Subscribers
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
