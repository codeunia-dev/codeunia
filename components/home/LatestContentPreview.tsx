import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Calendar, Users, Trophy, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { BlogPost } from "@/components/data/blog-posts"

export function LatestContentPreview() {
  const [latestBlogs, setLatestBlogs] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLatestBlogs = async () => {
      setIsLoading(true)
      setFetchError(null)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('date', { ascending: false })
        .limit(2)
      if (error) {
        setFetchError('Failed to fetch latest blogs.')
        setLatestBlogs([])
      } else {
        const posts = data.map((post: BlogPost) => ({
          ...post,
          tags: Array.isArray(post.tags)
            ? post.tags
            : (typeof post.tags === 'string' && post.tags
                ? (post.tags as string).split(',').map((t) => t.trim())
                : []),
        }))
        setLatestBlogs(posts)
      }
      setIsLoading(false)
    }
    fetchLatestBlogs()
  }, [])

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 via-background to-background relative overflow-hidden">
     
     
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-purple-500/15 to-pink-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/15 via-indigo-500/20 to-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
      
     
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 w-4 h-4 bg-primary/30 rounded-full blur-sm"
      />
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 left-20 w-3 h-3 bg-purple-500/40 rounded-full blur-sm"
      />
      <motion.div
        animate={{ y: [-5, 15, -5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/3 left-1/4 w-2 h-2 bg-blue-500/50 rounded-full blur-sm"
      />
      
      <div className="container px-4 mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* latest blog */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-3">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Badge variant="outline" className="px-4 py-2 rounded-full  hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary/15 to-purple-500/15 border-primary/30 backdrop-blur-sm shadow-lg">
                    <Sparkles className="w-3 h-3 mr-2 animate-pulse" />
                    📚 Latest Articles
                  </Badge>
                </motion.div>
                <motion.h3 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-4xl font-bold animate-fade-in"
                >
                  Fresh from the <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-pink-600 animate-gradient">Blog</span>
                </motion.h3>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Button variant="ghost" asChild className="hover:scale-105 transition-all duration-300 hover:text-primary group relative overflow-hidden">
                  <Link href="/blog">
                    <span className="relative z-10">View All</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>
                </Button>
              </motion.div>
            </div>
            <div className="space-y-8">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <span className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></span>
                </div>
              ) : fetchError ? (
                <div className="text-center text-red-500 py-10">{fetchError}</div>
              ) : latestBlogs.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">No latest blogs found.</div>
              ) : (
                latestBlogs.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.2 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="border-0 shadow-xl card-hover hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white/80 via-white/60 to-muted/30 dark:from-gray-900/80 dark:via-gray-800/60 dark:to-gray-900/30 backdrop-blur-sm relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <CardContent className="pt-6 relative z-10">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="secondary"
                              className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200 hover:scale-105 transition-all duration-300 shadow-md"
                            >
                              {post.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">{post.readTime}</span>
                          </div>
                          <h4 className="font-bold text-lg hover:text-primary cursor-pointer transition-colors duration-300 group">
                            <Link href={`/blog/${post.slug}`}>
                              {post.title}
                            </Link>
                            <span className="block h-0.5 w-0 bg-gradient-to-r from-primary to-purple-600 group-hover:w-full transition-all duration-500" />
                          </h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-full flex items-center justify-center mr-3 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl">
                              <span className="text-white text-sm font-bold">{post.author.split(' ').map((n) => n[0]).join('')}</span>
                            </div>
                            <span>By {post.author}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(post.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* upcoming events */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-3">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Badge variant="outline" className="px-4 py-2 hover:scale-105 rounded-full  transition-all duration-300 bg-gradient-to-r from-primary/15 to-purple-500/15 border-primary/30 backdrop-blur-sm shadow-lg">
                    <Sparkles className="w-3 h-3 mr-2 animate-pulse" />
                    🎯 Upcoming Events
                  </Badge>
                </motion.div>
                <motion.h3 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="text-4xl font-bold animate-fade-in"
                >
                  Join the <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-pink-600 animate-gradient">Action</span>
                </motion.h3>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <Button variant="ghost" asChild className="hover:scale-105 transition-all duration-300 hover:text-primary group relative overflow-hidden">
                  <Link href="/events">
                    <span className="relative z-10">View All</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>
                </Button>
              </motion.div>
            </div>
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="border-0 shadow-xl card-hover bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-purple-50/30 dark:from-purple-950/40 dark:via-pink-950/30 dark:to-purple-950/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="pt-6 relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-primary transform hover:scale-110 transition-transform duration-300 animate-pulse" />
                        <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">Dec 15-17, 2024</span>
                      </div>
                      <h4 className="font-bold text-xl hover:text-primary transition-colors duration-300 group">
                      RealityCode
                        <span className="block h-0.5 w-0 bg-gradient-to-r from-primary to-purple-600 group-hover:w-full transition-all duration-500" />
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        24-hour hackathon focused on AI and machine learning projects. Build innovative solutions and
                        compete for $10,000 in prizes...
                      </p>
                      <div className="flex flex-col gap-3 items-stretch lg:flex-row lg:items-center lg:justify-between lg:gap-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                          <span className="flex items-center bg-muted/50 px-3 py-1 rounded-full">
                            <Users className="h-4 w-4 mr-1 transform hover:scale-110 transition-transform duration-300" />
                            500 participants
                          </span>
                          <span className="flex items-center bg-muted/50 px-3 py-1 rounded-full">
                            <Trophy className="h-4 w-4 mr-1 text-yellow-500 transform hover:scale-110 transition-transform duration-300" />
                            ₹ 1,00,000 prize
                          </span>
                        </div>
                        <Button size="sm" className="glow-effect hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl w-full sm:w-auto">
                          Register Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.3 }}
                whileHover={{ y: -5 }}
              >
                <Card className="border-0 shadow-xl card-hover bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-blue-50/30 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/20 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="pt-6 relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-primary transform hover:scale-110 transition-transform duration-300 animate-pulse" />
                        <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">Dec 20, 2024</span>
                      </div>
                      <h4 className="font-bold text-xl hover:text-primary transition-colors duration-300 group">
                        Web3 Workshop Series
                        <span className="block h-0.5 w-0 bg-gradient-to-r from-primary to-purple-600 group-hover:w-full transition-all duration-500" />
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Learn blockchain development from industry experts. Hands-on workshops covering smart contracts,
                        DeFi, and NFTs...
                      </p>
                      <div className="flex flex-col gap-3 items-stretch lg:flex-row lg:items-center lg:justify-between lg:gap-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                          <span className="flex items-center bg-muted/50 px-3 py-1 rounded-full">
                            <Users className="h-4 w-4 mr-1 transform hover:scale-110 transition-transform duration-300" />
                            100 participants
                          </span>
                          <span className="flex items-center bg-muted/50 px-3 py-1 rounded-full">
                            <Trophy className="h-4 w-4 mr-1 text-yellow-500 transform hover:scale-110 transition-transform duration-300" />
                            Certificate
                          </span>
                        </div>
                        <Button size="sm" variant="outline" className="hover:scale-105 transition-all duration-300 border-primary text-primary hover:bg-gradient-to-r hover:from-primary hover:to-purple-600 hover:text-white shadow-lg hover:shadow-xl w-full sm:w-auto">
                          Join Workshop
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 