import { NextRequest } from 'next/server'
import { z, ZodSchema } from 'zod'
import { ApiErrors } from '@/lib/api/error'

/**
 * Validate request body against a Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
      
      throw ApiErrors.VALIDATION_ERROR('Request body validation failed', details)
    }
    
    throw ApiErrors.BAD_REQUEST('Invalid JSON in request body')
  }
}

/**
 * Validate request query parameters against a Zod schema
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  try {
    const { searchParams } = new URL(request.url)
    const params: Record<string, unknown> = {}
    
    // Convert URLSearchParams to object
    for (const [key, value] of searchParams.entries()) {
      // Try to parse as number or boolean
      if (value === 'true') {
        params[key] = true
      } else if (value === 'false') {
        params[key] = false
      } else if (!isNaN(Number(value)) && value !== '') {
        params[key] = Number(value)
      } else {
        params[key] = value
      }
    }
    
    return schema.parse(params)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
      
      throw ApiErrors.VALIDATION_ERROR('Query parameters validation failed', details)
    }
    
    throw ApiErrors.BAD_REQUEST('Invalid query parameters')
  }
}

/**
 * Validate request path parameters against a Zod schema
 */
export function validatePathParams<T>(
  params: Record<string, string | string[] | undefined>,
  schema: ZodSchema<T>
): T {
  try {
    // Convert path params to the expected format
    const pathParams: Record<string, unknown> = {}
    
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        pathParams[key] = value[0] // Take first value if array
      } else {
        pathParams[key] = value
      }
    }
    
    return schema.parse(pathParams)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
      
      throw ApiErrors.VALIDATION_ERROR('Path parameters validation failed', details)
    }
    
    throw ApiErrors.BAD_REQUEST('Invalid path parameters')
  }
}

/**
 * Validate request headers against a Zod schema
 */
export function validateHeaders(
  request: NextRequest,
  schema: ZodSchema<Record<string, string>>
): Record<string, string> {
  try {
    const headers: Record<string, string> = {}
    
    // Extract headers
    for (const [key, value] of request.headers.entries()) {
      headers[key.toLowerCase()] = value
    }
    
    return schema.parse(headers)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
      
      throw ApiErrors.VALIDATION_ERROR('Headers validation failed', details)
    }
    
    throw ApiErrors.BAD_REQUEST('Invalid headers')
  }
}

/**
 * Higher-order function to wrap API route handlers with validation
 */
export function withValidation<TBody = unknown, TQuery = unknown, TParams = unknown>(
  options: {
    body?: ZodSchema<TBody>
    query?: ZodSchema<TQuery>
    params?: ZodSchema<TParams>
    headers?: ZodSchema<Record<string, string>>
  }
) {
  return function <T extends any[]>(
    handler: (
      request: NextRequest,
      validated: {
        body?: TBody
        query?: TQuery
        params?: TParams
        headers?: Record<string, string>
      },
      ...args: T
    ) => Promise<Response>
  ) {
    return async (request: NextRequest, ...args: T): Promise<Response> => {
      try {
        const validated: {
          body?: TBody
          query?: TQuery
          params?: TParams
          headers?: Record<string, string>
        } = {}

        // Validate body if schema provided
        if (options.body) {
          validated.body = await validateRequestBody(request, options.body)
        }

        // Validate query params if schema provided
        if (options.query) {
          validated.query = validateQueryParams(request, options.query)
        }

        // Validate path params if schema provided
        if (options.params && args[0]) {
          validated.params = validatePathParams(args[0], options.params)
        }

        // Validate headers if schema provided
        if (options.headers) {
          validated.headers = validateHeaders(request, options.headers)
        }

        return await handler(request, validated, ...args)
      } catch (error) {
        // If it's already a Response (from validation errors), return it
        if (error instanceof Response) {
          return error
        }
        
        // Otherwise, return a generic error
        return ApiErrors.INTERNAL_ERROR('Validation failed')
      }
    }
  }
}

/**
 * Utility function to create validation schemas for common patterns
 */
export const createValidationSchemas = {
  // Pagination schema
  pagination: z.object({
    limit: z.number().int().min(1).max(100).default(10),
    offset: z.number().int().min(0).default(0),
  }),

  // Search schema
  search: z.object({
    search: z.string().min(1).max(100).optional(),
  }),

  // ID parameter schema
  idParam: z.object({
    id: z.string().min(1, 'ID is required'),
  }),

  // Slug parameter schema
  slugParam: z.object({
    slug: z.string().min(1, 'Slug is required'),
  }),

  // Authorization header schema
  authHeader: z.object({
    authorization: z.string().regex(/^Bearer\s+.+/, 'Invalid authorization header format'),
  }),
}
