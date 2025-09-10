import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

const defaultConfig = {
  siteName: 'Codeunia',
  siteUrl: 'https://codeunia.com',
  defaultImage: 'https://codeunia.com/og-image.png',
  twitterHandle: '@codeunia',
  author: 'Codeunia Team'
};

/**
 * Generate comprehensive SEO metadata
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = defaultConfig.defaultImage,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author = defaultConfig.author,
    section,
    tags = []
  } = config;

  const fullTitle = title.includes(defaultConfig.siteName) 
    ? title 
    : `${title} | ${defaultConfig.siteName}`;

  const fullUrl = url ? `${defaultConfig.siteUrl}${url}` : defaultConfig.siteUrl;
  const fullImage = image.startsWith('http') ? image : `${defaultConfig.siteUrl}${image}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: author }],
    creator: author,
    publisher: defaultConfig.siteName,
    
    // Favicon configuration
    icons: {
      icon: [
        { url: '/favicon.ico', type: 'image/x-icon' },
        { url: '/codeunia-favicon-light.svg', media: '(prefers-color-scheme: light)' },
        { url: '/codeunia-favicon-dark.svg', media: '(prefers-color-scheme: dark)' },
        { url: '/codeunia-favicon-light.svg' }
      ],
      apple: '/codeunia-favicon-light.svg',
      shortcut: '/favicon.ico'
    },
    
    // Open Graph
    openGraph: {
      type,
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: defaultConfig.siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      locale: 'en_US',
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags })
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
      creator: defaultConfig.twitterHandle,
      site: defaultConfig.twitterHandle
    },

    // Additional meta tags
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },

    // Canonical URL
    alternates: {
      canonical: fullUrl
    },

    // Verification tags (DNS verification used instead)
    verification: {
      google: '', // Using DNS verification
      yandex: '',
      yahoo: '',
      other: {
        'msvalidate.01': ''
      }
    }
  };

  return metadata;
}

/**
 * Generate structured data (JSON-LD)
 */
export function generateStructuredData(config: SEOConfig): object {
  const {
    title,
    description,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author = defaultConfig.author,
    image = defaultConfig.defaultImage
  } = config;

  const fullUrl = url ? `${defaultConfig.siteUrl}${url}` : defaultConfig.siteUrl;
  const fullImage = image.startsWith('http') ? image : `${defaultConfig.siteUrl}${image}`;

  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebSite',
    name: title,
    description,
    url: fullUrl,
    image: fullImage,
    publisher: {
      '@type': 'Organization',
      name: defaultConfig.siteName,
      url: defaultConfig.siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${defaultConfig.siteUrl}/logo.png`
      }
    },
    author: {
      '@type': 'Person',
      name: author
    }
  };

  if (type === 'article') {
    return {
      ...baseStructuredData,
      '@type': 'Article',
      headline: title,
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': fullUrl
      }
    };
  }

  if (type === 'profile') {
    return {
      ...baseStructuredData,
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: title,
        description,
        image: fullImage
      }
    };
  }

  return {
    ...baseStructuredData,
    '@type': 'WebSite',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${defaultConfig.siteUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Predefined SEO configurations for common pages
 */
export const SEOConfigs = {
  home: {
    title: 'Codeunia - Empowering Coders Globally',
    description: 'Join the global coding community. Participate in hackathons, compete on leaderboards, and advance your coding skills with Codeunia.',
    keywords: ['coding', 'hackathons', 'programming', 'developer', 'competition', 'leaderboard', 'coding community'],
    url: '/',
    type: 'website' as const
  },

  about: {
    title: 'About Codeunia',
    description: 'Learn about Codeunia\'s mission to empower coders worldwide through competitions, hackathons, and community building.',
    keywords: ['about', 'mission', 'coding community', 'developer platform'],
    url: '/about',
    type: 'website' as const
  },

  hackathons: {
    title: 'Hackathons',
    description: 'Participate in exciting coding hackathons and competitions. Showcase your skills and win amazing prizes.',
    keywords: ['hackathons', 'coding competitions', 'programming contests', 'developer events'],
    url: '/hackathons',
    type: 'website' as const
  },

  leaderboard: {
    title: 'Global Leaderboard',
    description: 'See the top coders from around the world. Track your progress and compete with the best developers.',
    keywords: ['leaderboard', 'top coders', 'ranking', 'competition results'],
    url: '/leaderboard',
    type: 'website' as const
  },

  opportunities: {
    title: 'Coding Opportunities',
    description: 'Discover internships, jobs, and career opportunities in the tech industry. Connect with top companies.',
    keywords: ['jobs', 'internships', 'career', 'tech jobs', 'developer opportunities'],
    url: '/opportunities',
    type: 'website' as const
  },

  blog: {
    title: 'Codeunia Blog',
    description: 'Read the latest articles about coding, technology trends, and developer insights from the Codeunia community.',
    keywords: ['blog', 'coding articles', 'tech news', 'developer insights'],
    url: '/blog',
    type: 'website' as const
  },

  contact: {
    title: 'Contact Us',
    description: 'Get in touch with the Codeunia team. We\'re here to help and answer your questions.',
    keywords: ['contact', 'support', 'help', 'get in touch'],
    url: '/contact',
    type: 'website' as const
  },

  signin: {
    title: 'Sign In',
    description: 'Sign in to your Codeunia account to access hackathons, leaderboards, and exclusive features.',
    keywords: ['sign in', 'login', 'account', 'authentication'],
    url: '/auth/signin',
    type: 'website' as const
  },

  signup: {
    title: 'Sign Up',
    description: 'Join Codeunia today! Create your account and start your coding journey with our global community.',
    keywords: ['sign up', 'register', 'join', 'create account'],
    url: '/auth/signup',
    type: 'website' as const
  }
};

/**
 * Generate metadata for a specific page
 */
export function getPageMetadata(page: keyof typeof SEOConfigs, customConfig?: Partial<SEOConfig>): Metadata {
  const config = { ...SEOConfigs[page], ...customConfig };
  return generateMetadata(config);
}

/**
 * Generate structured data for a specific page
 */
export function getPageStructuredData(page: keyof typeof SEOConfigs, customConfig?: Partial<SEOConfig>): object {
  const config = { ...SEOConfigs[page], ...customConfig };
  return generateStructuredData(config);
}
