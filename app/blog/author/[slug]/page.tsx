import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { authors } from '@/config/authors';
import { PersonJsonLd } from '@/components/seo/json-ld';
import Header from "@/components/header";
import Footer from "@/components/footer";
import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin, Twitter, BookOpen, Clock, Eye, ArrowRight, Star, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const author = authors[slug];

    if (!author) {
        return {
            title: 'Author Not Found',
        };
    }

    const url = `https://codeunia.com/blog/author/${slug}`;

    return {
        title: `${author.full_name} | ${author.role} at Codeunia`,
        description: author.bio_intro,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: author.full_name,
            description: author.bio_intro,
            url: url,
            type: 'profile',
            images: [
                {
                    url: author.avatar,
                    width: 800,
                    height: 800,
                    alt: author.full_name,
                },
            ],
        },
    };
}

export default async function AuthorPage({ params }: PageProps) {
    const { slug } = await params;
    const author = authors[slug];

    if (!author) {
        notFound();
    }

    const supabase = await createClient();

    // Fetch blog posts by author
    const { data: posts } = await supabase
        .from('blogs')
        .select('*')
        .eq('author', author.full_name)
        .order('date', { ascending: false });

    const authorUrl = `https://codeunia.com/blog/author/${slug}`;
    const sameAs = [
        author.social.linkedin,
        author.social.github,
        author.social.twitter,
        author.social.website,
        author.social.edulinkup,
    ].filter(Boolean) as string[];

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

    return (
        <>
            <PersonJsonLd
                url={authorUrl}
                name={author.full_name}
                image={author.avatar}
                jobTitle={author.role}
                sameAs={sameAs}
                description={author.bio_intro}
            />
            <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
                <Header />

                <main className="flex-grow container mx-auto px-4 py-20">
                    <div className="max-w-6xl mx-auto">
                        {/* Author Profile Section */}
                        <div className="max-w-4xl mx-auto bg-background/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-primary/10 mb-20">
                            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                                <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl flex-shrink-0">
                                    <Image
                                        src={author.avatar}
                                        alt={`${author.full_name} - ${author.role}`}
                                        fill
                                        className="object-cover object-top"
                                    />
                                </div>

                                <div className="flex-grow text-center md:text-left space-y-6">
                                    <div>
                                        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                                            {author.full_name}
                                        </h1>
                                        <p className="text-xl text-muted-foreground font-medium">
                                            {author.role}
                                        </p>
                                    </div>

                                    <p className="text-lg leading-relaxed text-muted-foreground max-w-2xl">
                                        {author.bio_intro}
                                    </p>

                                    <div className="flex items-center justify-center md:justify-start gap-4">
                                        <Button variant="outline" size="icon" asChild className="rounded-full hover:bg-primary/10 w-10 h-10">
                                            <Link href={author.social.github} target="_blank">
                                                <Github className="w-5 h-5" />
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="icon" asChild className="rounded-full hover:bg-primary/10 w-10 h-10">
                                            <Link href={author.social.linkedin} target="_blank">
                                                <Linkedin className="w-5 h-5" />
                                            </Link>
                                        </Button>
                                        {author.social.twitter && (
                                            <Button variant="outline" size="icon" asChild className="rounded-full hover:bg-primary/10 w-10 h-10">
                                                <Link href={author.social.twitter} target="_blank">
                                                    <Twitter className="w-5 h-5" />
                                                </Link>
                                            </Button>
                                        )}
                                        {author.social.website && (
                                            <Button variant="outline" size="icon" asChild className="rounded-full hover:bg-primary/10 w-10 h-10">
                                                <Link href={author.social.website} target="_blank">
                                                    <Globe className="w-5 h-5" />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Articles Section */}
                        <div className="space-y-12">
                            <div className="text-center space-y-4">
                                <h2 className="text-3xl md:text-4xl font-bold">Articles by {author.full_name}</h2>
                                <p className="text-muted-foreground max-w-2xl mx-auto">
                                    Explore all the thoughts, tutorials, and insights contributed by {author.full_name} to the Codeunia community.
                                </p>
                            </div>

                            {posts && posts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {posts.map((post) => (
                                        <Card key={post.id} className="flex flex-col h-full border-0 shadow-xl card-hover overflow-hidden group relative bg-gradient-to-br from-background to-muted/20">
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <div className="h-48 bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
                                                {post.image ? (
                                                    <Image
                                                        src={post.image}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full">
                                                        <BookOpen className="h-12 w-12 text-muted-foreground opacity-40" />
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3 z-10">
                                                    <Badge className={`${getCategoryColor(post.category)} shadow-lg`} variant="secondary">
                                                        {post.category}
                                                    </Badge>
                                                </div>
                                                {post.featured && (
                                                    <div className="absolute top-3 right-3 z-10">
                                                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                                                            <Star className="h-3 w-3 mr-1" />
                                                            Featured
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                            <CardHeader className="relative z-10">
                                                <CardTitle className="text-xl hover:text-primary cursor-pointer line-clamp-2 transition-colors">
                                                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                                </CardTitle>
                                                <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="relative z-10 flex-1 flex flex-col pt-0 mt-auto">
                                                <div className="flex items-center justify-between pt-4 border-t border-primary/5 mt-auto">
                                                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                        <span className="flex items-center">
                                                            <Clock className="h-3 h-3 mr-1" />
                                                            {post.readTime}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Eye className="h-3 h-3 mr-1" />
                                                            {post.views}
                                                        </span>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="hover:text-primary p-0 h-auto" asChild>
                                                        <Link href={`/blog/${post.slug}`} className="flex items-center">
                                                            Read <ArrowRight className="ml-1 h-3 h-3" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-primary/20">
                                    <BookOpen className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold">No articles yet</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                                        {author.full_name} hasn&apos;t published any articles yet. Check back soon!
                                    </p>
                                    <Button asChild className="bg-gradient-to-r from-primary to-purple-600">
                                        <Link href="/blog">Explore Other Articles</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
