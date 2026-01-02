import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin, Twitter, Globe } from "lucide-react";
import { Author } from "@/config/authors";
import { Button } from "@/components/ui/button";

interface AuthorBoxProps {
    author: Author;
}

export function AuthorBox({ author }: AuthorBoxProps) {
    return (
        <section className="my-12 p-8 bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl border border-primary/10 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                <div className="flex-shrink-0">
                    <Link href={`/blog/author/${author.slug}`}>
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg hover:border-primary/50 transition-colors">
                            <Image
                                src={author.avatar}
                                alt={`${author.full_name} - ${author.role}`}
                                fill
                                className="object-cover object-top"
                            />
                        </div>
                    </Link>
                </div>

                <div className="flex-grow space-y-4 text-center md:text-left">
                    <div className="space-y-1">
                        <h3 className="text-xl md:text-2xl font-bold">
                            About the Author: <span className="text-primary">{author.full_name}</span> — {author.role}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed italic">
                            {author.bio_intro}
                        </p>
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-3">
                        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 transition-colors">
                            <Link href={author.social.github} target="_blank" title="GitHub Profile">
                                <Github className="w-4 h-4" />
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 transition-colors">
                            <Link href={author.social.linkedin} target="_blank" title="LinkedIn Profile">
                                <Linkedin className="w-4 h-4" />
                            </Link>
                        </Button>
                        {author.social.twitter && (
                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 transition-colors">
                                <Link href={author.social.twitter} target="_blank" title="Twitter Profile">
                                    <Twitter className="w-4 h-4" />
                                </Link>
                            </Button>
                        )}
                        {author.social.website && (
                            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 transition-colors">
                                <Link href={author.social.website} target="_blank" title="Personal Website">
                                    <Globe className="w-4 h-4" />
                                </Link>
                            </Button>
                        )}
                        <Link
                            href={`/blog/author/${author.slug}`}
                            className="text-sm font-medium text-primary hover:underline ml-2"
                        >
                            View Profile
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
