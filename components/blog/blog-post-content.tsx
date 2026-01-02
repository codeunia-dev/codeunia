"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Lock, Heart, BookOpen, User, Calendar, Eye } from "lucide-react"
import Link from "next/link"
import { BlogPost } from "@/components/data/blog-posts"
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { ShareButton } from "@/components/ui/share-button"
import Image from "next/image"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AuthorBox } from "./author-box"
import { authors } from "@/config/authors"

function LikeButton({ slug, isAuthenticated, likeCount, setLikeCount, likedByUser, setLikedByUser }: {
    slug: string,
    isAuthenticated: boolean,
    likeCount: number,
    setLikeCount: React.Dispatch<React.SetStateAction<number>>,
    likedByUser: boolean,
    setLikedByUser: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const [loading, setLoading] = useState(false);

    const handleLike = async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        if (!likedByUser) {
            const res = await fetch(`/api/blog/${slug}/like`, { method: "POST" });
            if (res.ok) {
                setLikeCount((c) => c + 1);
                setLikedByUser(true);
            }
        } else {
            const res = await fetch(`/api/blog/${slug}/like`, { method: "DELETE" });
            if (res.ok) {
                setLikeCount((c) => c - 1);
                setLikedByUser(false);
            }
        }
        setLoading(false);
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span>
                    <Button
                        onClick={handleLike}
                        disabled={loading || !isAuthenticated}
                        variant={likedByUser ? "default" : "ghost"}
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        {likedByUser ? (
                            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                        ) : (
                            <Heart className="h-4 w-4" />
                        )}
                        <span>{likeCount}</span>
                    </Button>
                </span>
            </TooltipTrigger>
            <TooltipContent sideOffset={8}>
                {isAuthenticated ? (likedByUser ? "Unlike" : "Like") : "Login to like posts"}
            </TooltipContent>
        </Tooltip>
    );
}

export function BlogPostContent({ slug }: { slug: string }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [post, setPost] = useState<BlogPost | null>(null)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [likeCount, setLikeCount] = useState(0);
    const [likedByUser, setLikedByUser] = useState(false);
    const [views, setViews] = useState<number>(0);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setIsAuthenticated(!!user)
        }
        checkAuth()
    }, [])

    useEffect(() => {
        const fetchPost = async () => {
            setIsLoading(true)
            setFetchError(null)
            const supabase = createClient()
            const { data, error } = await supabase.from('blogs').select('*').eq('slug', slug).single()
            if (error || !data) {
                setFetchError('Blog post not found.')
                setPost(null)
            } else {
                setPost({
                    ...data,
                    tags: Array.isArray(data.tags)
                        ? data.tags
                        : (typeof data.tags === 'string' && data.tags
                            ? (data.tags as string).split(',').map((t: string) => t.trim())
                            : []),
                })
            }
            setIsLoading(false)
        }
        if (slug) fetchPost()
    }, [slug])

    useEffect(() => {
        async function fetchLikeData() {
            const res = await fetch(`/api/blog/${slug}/like`);
            if (res.ok) {
                const data = await res.json();
                setLikeCount(data.count);
                setLikedByUser(data.likedByUser);
            }
        }
        if (slug) fetchLikeData();
    }, [slug]);

    useEffect(() => {
        if (!slug) return;
        const viewedKey = `viewed_${slug}`;
        if (!localStorage.getItem(viewedKey)) {
            fetch(`/api/blog/${slug}/views`, { method: 'POST' })
                .then(res => res.json())
                .then(data => {
                    if (typeof data.views === 'number') setViews(data.views);
                });
            localStorage.setItem(viewedKey, 'true');
        } else {
            fetch(`/api/blog/${slug}/views`)
                .then(res => res.json())
                .then(data => {
                    if (typeof data.views === 'number') setViews(data.views);
                });
        }
        const supabase = createClient();
        const channel = supabase.channel('blogs-views')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'blogs',
                filter: `slug=eq.${slug}`,
            }, (payload: any) => {
                if (payload.new && typeof payload.new.views === 'number') {
                    setViews(payload.new.views);
                }
            })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [slug]);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "Frontend": return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
            case "Backend": return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
            case "DevOps": return "bg-gradient-to-r from-purple-500 to-violet-600 text-white"
            case "AI/ML": return "bg-gradient-to-r from-red-500 to-pink-600 text-white"
            case "Database": return "bg-gradient-to-r from-orange-500 to-amber-600 text-white"
            case "Tutorial": return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
            default: return "bg-gradient-to-r from-gray-500 to-slate-600 text-white"
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            </div>
        )
    }

    if (fetchError || !post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
                <div className="text-center space-y-4">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
                    <h1 className="text-2xl font-bold">{fetchError || 'Post not found'}</h1>
                    <Button asChild><Link href="/blog">Back to Blog</Link></Button>
                </div>
            </div>
        )
    }

    // Find matching author config by name or default to Akshay Kumar if it's his post
    const authorSlug = post.author.toLowerCase().replace(/ /g, '-');
    const authorConfig = authors[authorSlug] || (post.author.toLowerCase().includes("akshay") ? authors["akshay-kumar"] : null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <Header />
            <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
                <div className="container px-4 mx-auto py-4">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" asChild className="hover:bg-primary/10 transition-colors">
                            <Link href="/blog">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Blog
                            </Link>
                        </Button>
                        <div className="flex items-center space-x-4">
                            <ShareButton
                                url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://codeunia.com'}/blog/${slug}`}
                                title={post.title}
                                description={post.excerpt}
                                hashtags={post.tags}
                            />
                            <LikeButton slug={slug} isAuthenticated={isAuthenticated} likeCount={likeCount} setLikeCount={setLikeCount} likedByUser={likedByUser} setLikedByUser={setLikedByUser} />
                        </div>
                    </div>
                </div>
            </header>

            <article className="container px-4 mx-auto py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-6 mb-12">
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
                            {authorConfig ? (
                                <Link
                                    href={`/blog/author/${authorConfig.slug}`}
                                    className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm pl-1 pr-3 py-1 rounded-full hover:bg-primary/10 transition-colors group"
                                >
                                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-primary/20">
                                        <Image
                                            src={authorConfig.avatar}
                                            alt={authorConfig.full_name}
                                            fill
                                            className="object-cover object-top"
                                        />
                                    </div>
                                    <span className="font-medium group-hover:text-primary transition-colors">{post.author}</span>
                                </Link>
                            ) : (
                                <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full">
                                    <User className="h-4 w-4" />
                                    <span>{post.author}</span>
                                </div>
                            )}
                            <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(post.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full">
                                <Clock className="h-4 w-4" />
                                <span>{post.readTime}</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full">
                                <Eye className="h-4 w-4" />
                                <span>{views} views</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-12">
                        <div className="aspect-[1280/1080] bg-gradient-to-br from-muted to-muted/50 rounded-2xl overflow-hidden shadow-2xl relative w-full">
                            {post.image ? (
                                <Image src={post.image} alt={post.title} fill className="object-cover w-full h-full" priority />
                            ) : (
                                <div className="flex items-center justify-center h-full"><BookOpen className="h-16 w-16 opacity-40" /></div>
                            )}
                        </div>
                    </div>

                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        {isAuthenticated ? (
                            <div className="space-y-6">
                                <div className="prose prose-lg dark:prose-invert bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl">
                                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-8 border-t border-primary/10">
                                    {post.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-sm border-primary/20">#{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="prose prose-lg dark:prose-invert bg-background/50 backdrop-blur-sm p-8 rounded-2xl border border-primary/10 shadow-xl opacity-50 overflow-hidden max-h-96">
                                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{post.content.split('\n\n').slice(0, 3).join('\n\n')}</ReactMarkdown>
                                </div>
                                <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-primary/5 backdrop-blur-sm shadow-2xl p-8 text-center">
                                    <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold mb-3">Sign in to read the full article</h3>
                                    <div className="flex gap-4 justify-center">
                                        <Button asChild><Link href={`/auth/signin?returnUrl=${encodeURIComponent(`/blog/${slug}`)}`}>Sign In</Link></Button>
                                        <Button variant="outline" asChild><Link href={`/auth/signup?returnUrl=${encodeURIComponent(`/blog/${slug}`)}`}>Create Account</Link></Button>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* About Author Section */}
                    {authorConfig && <AuthorBox author={authorConfig} />}
                </div>
            </article>
            <Footer />
        </div>
    )
}
