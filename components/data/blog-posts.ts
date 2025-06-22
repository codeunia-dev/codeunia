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

export const categories = ["All", "Frontend", "Backend", "DevOps", "AI/ML", "Database", "Tutorial"]; 