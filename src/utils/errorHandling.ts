interface ApiError {
  message: string
  statusCode?: number
  error?: string
}

interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  statusCode?: number
}

export class BooklyError extends Error {
  public statusCode: number
  public originalError?: any

  constructor(message: string, statusCode: number = 500, originalError?: any) {
    super(message)
    this.name = 'BooklyError'
    this.statusCode = statusCode
    this.originalError = originalError
  }
}

/**
 * Extracts error message from various API response formats
 */
export function extractErrorMessage(error: any): string {
  // Handle direct error responses with message and statusCode
  if (error?.message && error?.statusCode) {
    return `${error.message} (${error.statusCode})`
  }

  // Handle API response with error field
  if (error?.error) {
    return typeof error.error === 'string' ? error.error : 'An error occurred'
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error
  }

  // Handle response data with message
  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  // Handle axios-style errors
  if (error?.response?.data?.error) {
    return error.response.data.error
  }

  // Handle network errors
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return 'Network error. Please check your connection and try again.'
  }

  // Handle timeout errors
  if (error?.code === 'TIMEOUT' || error?.message?.includes('timeout')) {
    return 'Request timed out. Please try again.'
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.'
}

/**
 * Gets user-friendly error message based on status code
 */
export function getUserFriendlyMessage(statusCode: number, defaultMessage: string): string {
  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input and try again.'
    case 401:
      return 'You are not authorized to perform this action. Please log in and try again.'
    case 403:
      return 'Access denied. You do not have permission to perform this action.'
    case 404:
      return 'The requested resource was not found.'
    case 409:
      return 'This action conflicts with existing data. Please refresh and try again.'
    case 422:
      return 'The data provided is invalid. Please check your input.'
    case 429:
      return 'Too many requests. Please wait a moment and try again.'
    case 500:
      return 'Server error. Please try again later.'
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.'
    default:
      return defaultMessage
  }
}

/**
 * Handles API response and throws appropriate errors
 */
export function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    const statusCode = response.statusCode || 500
    const message = getUserFriendlyMessage(statusCode, response.error)
    throw new BooklyError(message, statusCode, response)
  }

  if (!response.data) {
    throw new BooklyError('No data received from server', 500, response)
  }

  return response.data
}

/**
 * Wraps async operations with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  customErrorMessage?: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const message = customErrorMessage || extractErrorMessage(error)
    console.error('API Error:', error)
    throw new BooklyError(message, (error as any)?.statusCode || 500, error)
  }
}

/**
 * Logs errors with context for debugging
 */
export function logError(error: any, context: string, additionalData?: any) {
  console.group(`🚨 Error in ${context}`)
  console.error('Error:', error)
  if (additionalData) {
    console.error('Additional data:', additionalData)
  }
  console.error('Stack trace:', error?.stack)
  console.groupEnd()
}

/**
 * Creates a toast-friendly error message
 */
export function getToastErrorMessage(error: any): { message: string; type: 'error' | 'warning' } {
  const message = extractErrorMessage(error)
  const statusCode = (error as any)?.statusCode || 500

  // Return warning for user errors (4xx), error for server errors (5xx)
  const type = statusCode >= 400 && statusCode < 500 ? 'warning' : 'error'

  return { message, type }
}

/**
 * Check if error is a network/connectivity issue
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.code === 'NETWORK_ERROR' ||
    error?.message?.includes('Network Error') ||
    error?.message?.includes('Failed to fetch') ||
    !navigator.onLine
  )
}

/**
 * Check if error is an authorization issue
 */
export function isAuthError(error: any): boolean {
  const statusCode = (error as any)?.statusCode || (error as any)?.response?.status
  return statusCode === 401 || statusCode === 403
}

/**
 * Retry logic for failed requests
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      // Don't retry on auth errors or client errors
      if (isAuthError(error) || ((error as any)?.statusCode >= 400 && (error as any)?.statusCode < 500)) {
        throw error
      }

      if (attempt === maxRetries) {
        break
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  throw new BooklyError(
    `Operation failed after ${maxRetries} attempts: ${extractErrorMessage(lastError)}`,
    (lastError as any)?.statusCode || 500,
    lastError
  )
}