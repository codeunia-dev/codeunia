import DOMPurify from 'dompurify';

/**
 * Safe HTML sanitization utility using DOMPurify
 * Use this instead of dangerouslySetInnerHTML for user-generated content
 */

// Configuration for different sanitization levels
const sanitizeConfigs = {
  // For rich text content (blogs, descriptions)
  rich: {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    FORBID_SCRIPT_TAGS: true
  },
  
  // For basic formatting only
  basic: {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    FORBID_SCRIPT_TAGS: true
  },
  
  // Strip all HTML tags
  text: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  }
};

/**
 * Sanitize HTML content with DOMPurify
 * @param html - Raw HTML string to sanitize
 * @param level - Sanitization level: 'rich', 'basic', or 'text'
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(html: string, level: 'rich' | 'basic' | 'text' = 'basic'): string {
  if (!html) return '';
  
  // Server-side fallback when DOMPurify is not available
  if (typeof window === 'undefined') {
    return basicServerSideSanitize(html, level);
  }
  
  const config = sanitizeConfigs[level];
  return DOMPurify.sanitize(html, config);
}

/**
 * Basic server-side sanitization fallback
 * Used when DOMPurify is not available (SSR)
 */
function basicServerSideSanitize(html: string, level: 'rich' | 'basic' | 'text'): string {
  if (level === 'text') {
    // Strip all HTML tags
    return html.replace(/<[^>]*>/g, '');
  }
  
  // Remove dangerous tags and attributes with improved regex patterns
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:(?!image\/[png|jpg|jpeg|gif|webp])/gi, '') // Allow safe image data URLs
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Fix regex for event handlers
    .replace(/on\w+\s*=\s*[^>\s]+/gi, ''); // Catch unquoted event handlers
    
  if (level === 'basic') {
    // Allow only basic formatting tags with improved regex
    const allowedTags = ['p', 'br', 'strong', 'em', 'b', 'i'];
    // Escape special regex characters in tag names
    const escapedTags = allowedTags.map(tag => tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const tagPattern = new RegExp(`<(?!\/?(${escapedTags.join('|')})\\b)[^>]*>`, 'gi');
    sanitized = sanitized.replace(tagPattern, '');
  }
  
  return sanitized;
}

/**
 * React component for safely rendering HTML content
 * Use this instead of dangerouslySetInnerHTML
 */
export function createSafeHtmlProps(html: string, level: 'rich' | 'basic' | 'text' = 'basic') {
  const sanitizedHtml = sanitizeHtml(html, level);
  return { __html: sanitizedHtml };
}

/**
 * Hook for sanitizing HTML in React components
 */
export function useSanitizedHtml(html: string, level: 'rich' | 'basic' | 'text' = 'basic') {
  return sanitizeHtml(html, level);
}

/**
 * Sanitize user input for safe display
 * Use for user names, comments, etc.
 */
export function sanitizeUserInput(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .substring(0, 1000); // Limit length
}

/**
 * Validate and sanitize URLs
 * Use for user-provided links
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    
    // Check protocol
    if (!allowedProtocols.includes(parsed.protocol)) {
      return null;
    }
    
    // Additional security checks
    // Block localhost and private IP ranges
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'localhost' || 
        hostname.startsWith('127.') || 
        hostname.startsWith('192.168.') || 
        hostname.startsWith('10.') || 
        hostname.startsWith('172.')) {
      return null;
    }
    
    // Block dangerous ports
    const port = parsed.port;
    if (port && ['22', '23', '25', '53', '80', '443', '993', '995'].includes(port)) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
}

const htmlSanitizerUtils = {
  sanitizeHtml,
  createSafeHtmlProps,
  useSanitizedHtml,
  sanitizeUserInput,
  sanitizeUrl
};

export default htmlSanitizerUtils;
