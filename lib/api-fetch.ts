/**
 * Smart API fetch wrapper that handles caching based on environment
 * 
 * Development: Always fresh data (no cache)
 * Production: Normal caching for performance
 */

type ApiFetchOptions = RequestInit;

/**
 * Environment-aware fetch wrapper for API calls
 * Automatically disables caching in development for better DX
 */
export async function apiFetch(
  url: string, 
  options: ApiFetchOptions = {}
): Promise<Response> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Default options
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // In development, disable all caching for fresh data
  if (isDevelopment) {
    defaultOptions.cache = 'no-store';
    defaultOptions.headers = {
      ...defaultOptions.headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };
    
    // Add timestamp to prevent browser caching
    const separator = url.includes('?') ? '&' : '?';
    const timestampedUrl = `${url}${separator}_t=${Date.now()}`;
    
    console.log(`🔄 [DEV] Fresh API call: ${url}`);
    return fetch(timestampedUrl, defaultOptions);
  }

  // In production, use normal caching for performance
  console.log(`📡 [PROD] API call with caching: ${url}`);
  return fetch(url, defaultOptions);
}

/**
 * Helper for GET requests with automatic JSON parsing
 */
export async function apiGet<T = unknown>(url: string): Promise<T> {
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Helper for POST requests with automatic JSON handling
 */
export async function apiPost<T = unknown>(
  url: string, 
  data?: unknown, 
  options: ApiFetchOptions = {}
): Promise<T> {
  const response = await apiFetch(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json() as Promise<T>;
}

/**
 * Helper for PATCH requests
 */
export async function apiPatch<T = unknown>(
  url: string, 
  data?: unknown, 
  options: ApiFetchOptions = {}
): Promise<T> {
  const response = await apiFetch(url, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json() as Promise<T>;
}

/**
 * Helper for DELETE requests
 */
export async function apiDelete<T = unknown>(
  url: string, 
  options: ApiFetchOptions = {}
): Promise<T> {
  const response = await apiFetch(url, {
    method: 'DELETE',
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json() as Promise<T>;
}
