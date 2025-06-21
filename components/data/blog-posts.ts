export interface BlogPost {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    readTime: string;
    category: string;
    tags: string[];
    featured: boolean;
    image: string;
    views: string;
    likes: number;
  }
  
  export const blogPosts: BlogPost[] = [
    {
      id: 1,
      slug: "building-scalable-apis",
      title: "Building Scalable APIs with Node.js and Express",
      excerpt:
        "Learn best practices for building robust and scalable APIs that can handle millions of requests. We'll cover caching, rate limiting, and more.",
      author: "Akshay Kumar",
      date: "2025-06-18",
      readTime: "8 min read",
      category: "Backend",
      tags: ["Node.js", "Express", "API", "Scalability"],
      featured: true,
      image: "/placeholder.svg?height=200&width=400",
      views: "12.5K",
      likes: 245,
      content: `# Building Scalable APIs with Node.js and Express
  
  In this comprehensive guide, we'll explore the best practices for building robust and scalable APIs using Node.js and Express. We'll cover everything from basic setup to advanced techniques that will help your API handle millions of requests efficiently.
  
<img src="/images/developers/akshay.jpg" alt="API Diagram" width="200" height="200" />
  
  ## Getting Started
  
  First, let's set up our project structure and install the necessary dependencies...
  
  ## Caching Strategies
  
  One of the most important aspects of building scalable APIs is implementing proper caching...
  
  ## Rate Limiting
  
  To protect your API from abuse and ensure fair usage...
  
  ## Error Handling
  
  Proper error handling is crucial for maintaining a reliable API...
  
  ## Testing and Monitoring
  
  Finally, we'll look at how to test and monitor your API's performance...`
    },
    {
      id: 2,
      slug: "react-18-features",
      title: "React 18 Features You Should Know About",
      excerpt:
        "Explore the latest features in React 18 including concurrent rendering, automatic batching, and the new Suspense improvements.",
      author: "Akshay Kumar",
      date: "2025-06-18",
      readTime: "6 min read",
      category: "Frontend",
      tags: ["React", "JavaScript", "Frontend"],
      featured: true,
      image: "/placeholder.svg?height=200&width=400",
      views: "8.2K",
      likes: 189,
      content: `# React 18 Features You Should Know About
  
  React 18 introduces several groundbreaking features that enhance the way we build user interfaces...`
    },
    {
      id: 3,
      slug: "typescript-2024",
      title: "Getting Started with TypeScript in 2024",
      excerpt:
        "A comprehensive guide to TypeScript for beginners. Learn the fundamentals and best practices for type-safe JavaScript development.",
      author: "Akshay Kumar",
      date: "2025-06-18",
      readTime: "10 min read",
      category: "Tutorial",
      tags: ["TypeScript", "JavaScript", "Tutorial"],
      featured: false,
      image: "/placeholder.svg?height=200&width=400",
      views: "6.8K",
      likes: 156,
      content: `# Getting Started with TypeScript in 2024
  
  A comprehensive guide to TypeScript for beginners...`
    },
       {
      id: 4,
      slug: "building-scalable-apis",
      title: "Building Scalable APIs with Node.js and Express",
      excerpt:
        "Learn best practices for building robust and scalable APIs that can handle millions of requests. We'll cover caching, rate limiting, and more.",
      author: "Akshay Kumar",
      date: "2025-06-18",
      readTime: "8 min read",
      category: "Backend",
      tags: ["Node.js", "Express", "API", "Scalability"],
      featured: false,
      image: "/placeholder.svg?height=200&width=400",
      views: "12.5K",
      likes: 245,
      content: `# Building Scalable APIs with Node.js and Express
  
  In this comprehensive guide, we'll explore the best practices for building robust and scalable APIs using Node.js and Express. We'll cover everything from basic setup to advanced techniques that will help your API handle millions of requests efficiently.
  
  ## Getting Started
  
  First, let's set up our project structure and install the necessary dependencies...
  
  ## Caching Strategies
  
  One of the most important aspects of building scalable APIs is implementing proper caching...
  
  ## Rate Limiting
  
  To protect your API from abuse and ensure fair usage...
  
  ## Error Handling
  
  Proper error handling is crucial for maintaining a reliable API...
  
  ## Testing and Monitoring
  
  Finally, we'll look at how to test and monitor your API's performance...`
    },
  ];
  
  export const categories = ["All", "Frontend", "Backend", "DevOps", "AI/ML", "Database", "Tutorial"];
  
  // Helper functions
  export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
    return blogPosts.find(post => post.slug === slug);
  };
  
  export const getAllBlogPosts = (): BlogPost[] => {
    return blogPosts;
  }; 