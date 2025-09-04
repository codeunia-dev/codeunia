import { useRouter } from 'next/navigation';

/**
 * Safe navigation utilities to replace direct window.location.href usage
 * Validates URLs and prevents open redirect vulnerabilities
 */

// Allowed domains for external redirects
const ALLOWED_DOMAINS = [
  'codeunia.com',
  'www.codeunia.com',
  'localhost:3000', // for development
];

/**
 * Validate if a URL is safe for redirection
 * @param url - URL to validate
 * @returns boolean indicating if URL is safe
 */
export function isSafeRedirectUrl(url: string): boolean {
  try {
    // Relative URLs starting with / (but not //) are safe
    if (url.startsWith('/') && !url.startsWith('//')) {
      return true;
    }

    // Parse absolute URLs
    const parsed = new URL(url);
    
    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    // Check if domain is in allowed list
    return ALLOWED_DOMAINS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Safe navigation hook for client-side routing
 * @returns Navigation functions with safety checks
 */
export function useSafeNavigation() {
  const router = useRouter();

  const navigateTo = (url: string) => {
    if (!isSafeRedirectUrl(url)) {
      console.warn(`Blocked unsafe redirect to: ${url}`);
      return;
    }

    // Use Next.js router for internal navigation
    if (url.startsWith('/')) {
      router.push(url);
    } else {
      // External links - open in new tab for security
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const replaceTo = (url: string) => {
    if (!isSafeRedirectUrl(url)) {
      console.warn(`Blocked unsafe redirect to: ${url}`);
      return;
    }

    if (url.startsWith('/')) {
      router.replace(url);
    } else {
      window.location.href = url;
    }
  };

  return {
    navigateTo,
    replaceTo,
    router
  };
}

/**
 * Server-side safe redirect validation
 * Use in API routes and server components
 */
export function validateServerRedirect(url: string, defaultRedirect: string = '/'): string {
  if (!url || !isSafeRedirectUrl(url)) {
    return defaultRedirect;
  }
  return url;
}

/**
 * Create safe external link props
 * Use for external links to add security attributes
 */
export function createSafeLinkProps(href: string) {
  const isExternal = !href.startsWith('/');
  
  return {
    href: isSafeRedirectUrl(href) ? href : '#',
    ...(isExternal && {
      target: '_blank',
      rel: 'noopener noreferrer'
    })
  };
}

/**
 * Create safe button click handler for navigation
 * Use in onClick handlers to replace window.location.href
 */
export function createSafeClickHandler(to: string, fallback: string = '/') {
  return () => {
    const { navigateTo } = useSafeNavigation();
    const redirectUrl = isSafeRedirectUrl(to) ? to : fallback;
    navigateTo(redirectUrl);
  };
}

const safeNavigationUtils = {
  isSafeRedirectUrl,
  useSafeNavigation,
  validateServerRedirect,
  createSafeLinkProps,
  createSafeClickHandler
};

export default safeNavigationUtils;
