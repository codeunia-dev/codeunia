import { NextResponse } from 'next/server'

export interface ApiError {
  error: string
  message?: string
  details?: unknown
  code?: string
  timestamp: string
}

export interface ApiSuccess<T = unknown> {
  data: T
  message?: string
  timestamp: string
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: string,
  status: number = 500,
  context?: {
    message?: string
    details?: unknown
    code?: string
  }
): NextResponse<ApiError> {
  const errorResponse: ApiError = {
    error,
    timestamp: new Date().toISOString(),
    ...context,
  }

  return NextResponse.json(errorResponse, { status })
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  message?: string
): NextResponse<ApiSuccess<T>> {
  const successResponse: ApiSuccess<T> = {
    data,
    timestamp: new Date().toISOString(),
    ...(message && { message }),
  }

  return NextResponse.json(successResponse, { status })
}

/**
 * Common error responses
 */
export const ApiErrors = {
  // 400 Bad Request
  BAD_REQUEST: (message = 'Invalid request') =>
    createErrorResponse('Bad Request', 400, { message }),

  // 401 Unauthorized
  UNAUTHORIZED: (message = 'Authentication required') =>
    createErrorResponse('Unauthorized', 401, { message }),

  // 403 Forbidden
  FORBIDDEN: (message = 'Access denied') =>
    createErrorResponse('Forbidden', 403, { message }),

  // 404 Not Found
  NOT_FOUND: (message = 'Resource not found') =>
    createErrorResponse('Not Found', 404, { message }),

  // 409 Conflict
  CONFLICT: (message = 'Resource already exists') =>
    createErrorResponse('Conflict', 409, { message }),

  // 422 Unprocessable Entity
  VALIDATION_ERROR: (message = 'Validation failed', details?: unknown) =>
    createErrorResponse('Validation Error', 422, { message, details }),

  // 429 Too Many Requests
  RATE_LIMITED: (message = 'Too many requests') =>
    createErrorResponse('Rate Limited', 429, { message }),

  // 500 Internal Server Error
  INTERNAL_ERROR: (message = 'Internal server error') =>
    createErrorResponse('Internal Server Error', 500, { message }),

  // 503 Service Unavailable
  SERVICE_UNAVAILABLE: (message = 'Service temporarily unavailable') =>
    createErrorResponse('Service Unavailable', 503, { message }),
}

/**
 * Common success responses
 */
export const ApiSuccess = {
  // 200 OK
  OK: <T>(data: T, message?: string) =>
    createSuccessResponse(data, 200, message),

  // 201 Created
  CREATED: <T>(data: T, message = 'Resource created successfully') =>
    createSuccessResponse(data, 201, message),

  // 202 Accepted
  ACCEPTED: <T>(data: T, message = 'Request accepted') =>
    createSuccessResponse(data, 202, message),

  // 204 No Content
  NO_CONTENT: () =>
    new NextResponse(null, { status: 204 }),
}
