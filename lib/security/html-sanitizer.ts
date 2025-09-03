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
  
  // Remove dangerous tags and attributes
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
    .replace(/data:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
    
  if (level === 'basic') {
    // Allow only basic formatting tags
    const allowedTags = ['p', 'br', 'strong', 'em', 'b', 'i'];
    const tagPattern = new RegExp(`<(?!\/?(${allowedTags.join('|')})\b)[^>]*>`, 'gi');
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
    
    if (!allowedProtocols.includes(parsed.protocol)) {
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
