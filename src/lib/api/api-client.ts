// API Client configuration
const API_BASE_URL = '/api/proxy'

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private getLangFromPath(pathname: string): string {
    const langMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/)
    return langMatch ? langMatch[1] : 'en'
  }

  private getPathWithoutLang(pathname: string): string {
    return pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/'
  }

  private resolveUnauthorizedRedirect(pathname: string, userType?: string | null): string {
    const lang = this.getLangFromPath(pathname)
    const cleanPath = this.getPathWithoutLang(pathname)

    const dashboardPrefixes = ['/apps', '/dashboards', '/pages', '/forms', '/charts', '/react-table', '/super-admin']
    const customerPrefixes = [
      '/landpage',
      '/search',
      '/profile',
      '/appointments',
      '/business',
      '/service',
      '/category',
      '/customer'
    ]

    if (dashboardPrefixes.some(prefix => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`))) {
      return `/${lang}/login`
    }

    if (customerPrefixes.some(prefix => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`))) {
      return `/${lang}/customer/login`
    }

    return userType === 'business' ? `/${lang}/login` : `/${lang}/customer/login`
  }

  private shouldSkipAuthRedirect(endpoint: string): boolean {
    return /\/(?:admin\/|superadmin\/)?auth\/(?:login|register|verify|forget-password|forgot-password|reset-password|resend-code)/.test(
      endpoint
    )
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      }

      const response = await fetch(url, config)

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = errorText

        // Try to parse JSON error response to get the actual message
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch (parseError) {
          // If parsing fails, use the raw text
          console.warn('Could not parse error response as JSON:', parseError)
        }

        // Handle unauthorized globally (except auth endpoints)
        if (response.status === 401 && !this.shouldSkipAuthRedirect(endpoint)) {
          console.warn('🔒 401 Unauthorized - Token may be invalid or expired')

          // Import auth store dynamically to avoid circular dependencies
          const { useAuthStore } = await import('@/stores/auth.store')
          const store = useAuthStore.getState()

          if (store.booklyUser || store.userType === 'customer') {
            store.logoutCustomer()
          } else if (store.materializeUser || store.userType === 'business') {
            store.logoutBusiness()
          }

          if (typeof window !== 'undefined') {
            const redirectPath = this.resolveUnauthorizedRedirect(window.location.pathname, store.userType)
            if (window.location.pathname !== redirectPath) {
              window.location.href = redirectPath
            }
          }
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error('❌ API request failed:', error)
      return { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // GET request
  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  // POST request
  async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    let processedBody: string | FormData | URLSearchParams | undefined

    if (body instanceof URLSearchParams) {
      processedBody = body
    } else if (body instanceof FormData) {
      processedBody = body
    } else if (body) {
      processedBody = JSON.stringify(body)
    }

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: processedBody,
    })
  }

  // PATCH request
  async patch<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  // DELETE request
  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  // Set authorization header
  setAuthToken(token: string) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`,
    }
  }

  // Remove authorization header (only clears from API client, not localStorage)
  clearAuthToken() {
    const { Authorization, ...headers } = this.defaultHeaders as any
    this.defaultHeaders = headers
  }

  // Force clear token from both API client and localStorage (used during logout)
  forceCleanupToken() {
    const { Authorization, ...headers } = this.defaultHeaders as any
    this.defaultHeaders = headers

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }
}

export const apiClient = new ApiClient()
