"use client" 

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Clock, ArrowRight, BookOpen, Star, TrendingUp, Lock, Sparkles, Eye, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion } from "framer-motion"
import { categories, BlogPost } from "@/components/data/blog-posts"
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)
      setFetchError(null)
      const supabase = createClient()
      const { data, error } = await supabase.from('blogs').select('*').order('date', { ascending: false })
      if (error) {
        setFetchError('Failed to fetch blog posts.')
        setBlogPosts([])
      } else {
       
        const posts = data.map((post: BlogPost) => ({
          ...post,
          tags: Array.isArray(post.tags)
            ? post.tags
            : (typeof post.tags === 'string' && post.tags
                ? (post.tags as string).split(',').map((t) => t.trim())
                : []),
        }))
        setBlogPosts(posts)
      }
      setIsLoading(false)
    }
    fetchPosts()
  }, [])

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredPosts = filteredPosts.filter((post) => post.featured)
  const regularPosts = filteredPosts.filter((post) => !post.featured)

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

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case "Frontend":
        return "from-blue-500/20 via-indigo-500/10 to-purple-500/20"
      case "Backend":
        return "from-emerald-500/20 via-teal-500/10 to-cyan-500/20"
      case "DevOps":
        return "from-purple-500/20 via-violet-500/10 to-fuchsia-500/20"
      case "AI/ML":
        return "from-red-500/20 via-pink-500/10 to-rose-500/20"
      case "Database":
        return "from-orange-500/20 via-amber-500/10 to-yellow-500/20"
      case "Tutorial":
        return "from-yellow-500/20 via-orange-500/10 to-red-500/20"
      default:
        return "from-gray-500/20 via-slate-500/10 to-zinc-500/20"
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

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">{fetchError}</h1>
          <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-primary to-purple-600">Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/10">
       <Header/>
      {/* Hero Section */}
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
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "4s" }}></div>
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
                <motion.button 
                  className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="absolute inset-0 overflow-hidden rounded-full">
                    <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </span>
                  <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10">
                    <span>Developer Blog</span>
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                </motion.button>
              </div>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold tracking-tight leading-tight"
            >
              Learn from the{" "}
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
                Community
              </motion.span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              Discover tutorials, insights, and best practices from experienced developers. Stay updated with the latest
              trends in technology and advance your skills.
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* search and filters */}
      <section className="py-12 bg-gradient-to-b from-muted/30 to-background relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5"></div>
        <div className="container px-4 mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 shadow-lg border-2 focus:border-primary/50 transition-all duration-300 bg-background/80 backdrop-blur-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Button
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {category}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div 
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-sm text-muted-foreground">
              Showing {filteredPosts.length} of {blogPosts.length} total articles
            </p>
          </motion.div>
        </div>
      </section>

      {/* featured blogs */}
      {featuredPosts.length > 0 && (
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background"></div>
          <div className="container px-4 mx-auto relative z-10">
            <motion.div 
              className="text-center space-y-6 mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="px-4 py-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
                ⭐ Featured Articles
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                Editor&apos;s <span className="gradient-text">Picks</span>
              </h2>
              <p className="text-sm text-muted-foreground">{featuredPosts.length} featured articles</p>
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card className="border-0 shadow-2xl card-hover overflow-hidden bg-gradient-to-br from-primary/5 to-purple-500/5 glow-effect group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="h-48 bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10"></div>
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className={`${getCategoryColor(post.category)} shadow-lg`} variant="secondary">
                          {post.category}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
                        <div className="flex items-center text-sm text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
                          <Clock className="h-4 w-4 mr-1" />
                          {post.readTime}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {post.views}
                          </span>
                          <span className="flex items-center bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">❤️ {post.likes}</span>
                        </div>
                      </div>
                    </div>
                    <CardHeader className="relative z-10">
                      <CardTitle className="text-2xl hover:text-primary cursor-pointer transition-colors group-hover:scale-105 transform duration-300">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed">{post.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-sm font-bold">
                              {post.author
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{post.author}</p>
                            <p className="text-sm text-muted-foreground">{new Date(post.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {isAuthenticated ? (
                          <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform bg-gradient-to-r from-primary/10 to-purple-500/10 hover:from-primary/20 hover:to-purple-500/20" asChild>
                            <Link href={`/blog/${post.slug}`}>
                              Read More <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform bg-gradient-to-r from-primary/10 to-purple-500/10 hover:from-primary/20 hover:to-purple-500/20" asChild>
                            <Link href={`/auth/signin?returnUrl=${encodeURIComponent('/blog')}`}>
                              Sign in to read <Lock className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* all blogs */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5"></div>
        <div className="container px-4 mx-auto relative z-10">
          <motion.div 
            className="flex items-center justify-between mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <Badge variant="outline" className="px-3 py-1 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
                📖 All Articles
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                Latest <span className="gradient-text">Stories</span>
              </h2>
            </div>
            <div className="text-sm text-muted-foreground font-medium bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
              {regularPosts.length} articles found
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post, index) => (
              <motion.div
                key={post.id}
                className="flex h-full"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="flex flex-col h-full border-0 shadow-xl card-hover overflow-hidden group relative bg-gradient-to-br from-background to-muted/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="h-40 bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(post.category)}`}></div>
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className={`${getCategoryColor(post.category)} shadow-lg`} variant="secondary">
                        {post.category}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                      <div className="flex items-center text-sm text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                        <Clock className="h-4 w-4 mr-1" />
                        {post.readTime}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span className="flex items-center bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                          <Eye className="h-4 w-4 mr-1" />
                          {post.views}
                        </span>
                        <span className="flex items-center bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                  <CardHeader className="relative z-10 flex-shrink-0">
                    <CardTitle className="text-lg hover:text-primary cursor-pointer line-clamp-2 transition-colors group-hover:scale-105 transform duration-300">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10 flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-xs font-bold">
                            {post.author
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{post.author}</p>
                          <p className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {isAuthenticated ? (
                        <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform bg-gradient-to-r from-primary/10 to-purple-500/10 hover:from-primary/20 hover:to-purple-500/20" asChild>
                          <Link href={`/blog/${post.slug}`}>
                            Read More <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform bg-gradient-to-r from-primary/10 to-purple-500/10 hover:from-primary/20 hover:to-purple-500/20" asChild>
                          <Link href={`/auth/signin?returnUrl=${encodeURIComponent('/blog')}`}>
                            Sign in to read <Lock className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {regularPosts.length === 0 && (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-32 h-32 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 animate-pulse"></div>
                <BookOpen className="h-16 w-16 text-muted-foreground relative z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No articles found</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Try adjusting your search terms or browse different categories.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("All")
                }}
                className="glow-effect hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-purple-600"
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      <Footer/>
    </div>
  )
}