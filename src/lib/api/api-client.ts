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

      console.log('🚀 API Request:', {
        url,
        method: config.method || 'GET',
        headers: config.headers,
        body: config.body,
        hasAuthHeader: !!(config.headers as any)?.Authorization,
      })

      const response = await fetch(url, config)

      console.log('📡 API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url
        })

        // Check if this is an auth error that should trigger logout
        if (response.status === 401) {
          console.warn('🔒 401 Unauthorized - Token may be invalid or expired')

          // Import auth store dynamically to avoid circular dependencies
          const { useAuthStore } = await import('@/stores/auth.store')
          const store = useAuthStore.getState()

          // Check which user type is logged in and logout accordingly
          if (store.booklyUser && store.userType === 'customer') {
            console.log('🚪 Logging out customer user due to 401')
            store.logoutCustomer()

            // Redirect to customer login
            if (typeof window !== 'undefined') {
              // Get current language from URL
              const path = window.location.pathname
              const langMatch = path.match(/^\/([a-z]{2})\//)
              const lang = langMatch ? langMatch[1] : 'en'
              window.location.href = `/${lang}/customer/login`
            }
          } else if (store.materializeUser && store.userType === 'business') {
            console.log('🚪 Logging out business user due to 401')
            store.logoutBusiness()

            // Redirect to business login
            if (typeof window !== 'undefined') {
              window.location.href = '/admin/login'
            }
          }
        }

        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ API Success:', data)
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