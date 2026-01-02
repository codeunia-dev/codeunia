import { Metadata } from 'next';
import { createClient } from "@/lib/supabase/server"
import { BlogPostContent } from "@/components/blog/blog-post-content"

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from('blogs').select('title, excerpt, image, tags').eq('slug', slug).single();

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const url = `https://codeunia.com/blog/${slug}`;

  return {
    title: `${post.title} | Codeunia Blog`,
    description: post.excerpt,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: url,
      type: 'article',
      images: post.image ? [{ url: post.image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : [],
    }
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <BlogPostContent slug={slug} />;
}