export interface Author {
    slug: string;
    full_name: string;
    role: string;
    bio_intro: string;
    avatar: string;
    social: {
        linkedin: string;
        github: string;
        twitter?: string;
        website?: string;
        edulinkup?: string;
    };
}

export const authors: Record<string, Author> = {
    "akshay-kumar": {
        slug: "akshay-kumar",
        full_name: "Akshay Kumar",
        role: "Full Stack Developer",
        bio_intro: "Akshay Kumar is a dedicated Full Stack Developer specializing in building scalable web applications and seamless user experiences. With expertise in modern technologies, he leads development initiatives to deliver high-quality, performant digital solutions.",
        avatar: "/images/team/akshay.jpg",
        social: {
            linkedin: "https://www.linkedin.com/in/akshaykumar0611/",
            github: "https://github.com/akshay0611",
            twitter: "https://x.com/Aksh0605",
            website: "https://connectwithakshay.netlify.app",
            edulinkup: "https://edulinkup.dev/blog/author/akshay-kumar",
        },
    },
};
