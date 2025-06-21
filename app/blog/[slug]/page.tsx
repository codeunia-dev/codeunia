"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Lock, Heart, Share2, BookOpen, User, Calendar, Eye } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { getBlogPostBySlug } from "@/components/data/blog-posts"
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import Header from "@/components/header";
import Footer from "@/components/footer";

export default function BlogPostPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  
  const slug = params?.slug as string
  const post = getBlogPostBySlug(slug)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Frontend":
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
      case "Backend":
        return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
      case "DevOps":
        return "bg-gradient-to-r from-purple-500 to-violet-600 text-white"
      case "AI/ML":
        return "bg-gradient-to-r from-red-500 to-pink-600 text-white"
      case "Database":
        return "bg-gradient-to-r from-orange-500 to-amber-600 text-white"
      case "Tutorial":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-600 text-white"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
            <div className="absolute inset-0 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse mx-auto"></div>
          </div>
          <h1 className="text-2xl font-bold">Blog post not found</h1>
          <p className="text-muted-foreground">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <Button asChild className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* header */}
      <Header/>
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
        <div className="container px-4 mx-auto py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button variant="ghost" asChild className="hover:bg-primary/10 transition-colors">
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Blog
                </Link>
              </Button>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-colors">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-colors">
                <Heart className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* article content */}
      <article className="container px-4 mx-auto py-12">
        <div className="max-w-4xl mx-auto">
          {/* article header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 mb-12"
          >
            <div className="flex items-center space-x-4">
              <Badge className={`${getCategoryColor(post.category)} shadow-lg`} variant="secondary">
                {post.category}
              </Badge>
              {post.featured && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                  ⭐ Featured
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              {post.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
              <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full">
                <Eye className="h-4 w-4" />
                <span>{post.views} views</span>
              </div>
              <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full">
                <Heart className="h-4 w-4" />
                <span>{post.likes} likes</span>
              </div>
            </div>
          </motion.div>

          {/* article image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-2xl overflow-hidden shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10"></div>
              <div className="w-full h-full flex items-center justify-center relative z-10">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
                    <div className="absolute inset-0 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse mx-auto"></div>
                  </div>
                  <p className="text-muted-foreground">Blog post image placeholder</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* article content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="prose prose-lg dark:prose-invert max-w-none"
          >
            {isAuthenticated ? (
              <div className="space-y-6">
                {/* full content for authenticated users */}
                <div className="prose prose-lg dark:prose-invert bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {post.content}
                  </ReactMarkdown>
                </div>
                
                {/* tags */}
                <div className="flex flex-wrap gap-2 pt-8 border-t border-primary/10">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-sm bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-colors">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* preview content for non-authenticated users */}
                <div className="prose prose-lg dark:prose-invert bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {post.content.split('\n\n').slice(0, 3).join('\n\n')}
                  </ReactMarkdown>
                </div>
                
                {/* authentication prompt */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-primary/5 backdrop-blur-sm shadow-2xl">
                    <CardContent className="pt-8 pb-8">
                      <div className="text-center space-y-6">
                        <div className="relative">
                          <Lock className="h-12 w-12 text-primary mx-auto" />
                          <div className="absolute inset-0 w-12 h-12 bg-primary/20 rounded-full blur-xl animate-pulse mx-auto"></div>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-3">Sign in to read the full article</h3>
                          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            This article is available to authenticated users only. Sign in to access the complete content.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button asChild className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg">
                              <Link href={`/auth/signin?returnUrl=${encodeURIComponent(`/blog/${params.slug}`)}`}>
                                Sign In to Continue
                              </Link>
                            </Button>
                            <Button variant="outline" asChild className="border-primary/20 hover:bg-primary/10 transition-colors">
                              <Link href={`/auth/signup?returnUrl=${encodeURIComponent(`/blog/${params.slug}`)}`}>
                                Create Account
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </article>
      <Footer/>
    </div>
  )
}