'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AuthService } from '@/lib/api'
import type { LoginRequest, RegisterUserRequest, VerifyAccountRequest } from '@/lib/api'

// Mock authentication flag - set to true to use mock auth for customers
// This allows testing customer flows without backend connection
const USE_MOCK_CUSTOMER_AUTH = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true' || true // Default to true until backend is ready

// Mock customer data for testing
const MOCK_CUSTOMERS: Record<string, { password: string; name: string; avatar?: string }> = {
  'test@example.com': { password: 'password123', name: 'Test User' },
  'customer@bookly.com': { password: 'customer123', name: 'Demo Customer' },
  'john@example.com': { password: 'john123', name: 'John Doe' }
}

export type UserType = 'customer' | 'business'

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar?: string
  role?: string
  isOwner?: boolean
  business?: {
    id: string
    name: string
    email: string | null
    description: string | null
    logo: string | null
    approved: boolean
    createdAt: string
    updatedAt: string
    rating: number
    socialLinks?: Array<{ platform: string; url: string }>
  }
}

interface AuthState {
  // Domain
  userType: UserType | null

  // Bookly (Customer) auth
  booklyUser: AuthUser | null

  // Materialize (Business) auth
  materializeUser: AuthUser | null

  // Shared
  token: string | null
  loading: boolean
  error: string | null
  lastActivity: number | null
  sessionExpiry: number | null

  // Actions
  setUserType: (type: UserType | null) => void

  // Utility methods
  isAuthenticated: () => boolean
  isSessionValid: () => boolean
  refreshSession: () => void
  clearError: () => void
  checkAndCleanupExpiredSession: () => void

  // Bookly
  loginCustomer: (payload: LoginRequest) => Promise<void>
  registerCustomer: (payload: RegisterUserRequest) => Promise<void>
  verifyCustomer: (payload: VerifyAccountRequest) => Promise<void>
  logoutCustomer: () => void

  // Materialize
  loginAdmin: (payload: LoginRequest) => Promise<void>
  setMaterializeUser: (user: AuthUser | null) => void
  logoutBusiness: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userType: null,
      booklyUser: null,
      materializeUser: null,
      token: null,
      loading: false,
      error: null,
      lastActivity: null,
      sessionExpiry: null,

      setUserType: type => set({ userType: type }),

      // Utility methods
      isAuthenticated: () => {
        const state = get()
        return !!(state.booklyUser && state.token) || !!(state.materializeUser && state.token)
      },

      isSessionValid: () => {
        const state = get()
        const now = Date.now()

        // Check if session has expired
        if (state.sessionExpiry && now > state.sessionExpiry) {
          return false
        }

        // Check if last activity was too long ago (24 hours)
        if (state.lastActivity && now - state.lastActivity > 24 * 60 * 60 * 1000) {
          return false
        }

        return true
      },

      refreshSession: () => {
        const state = get()
        const now = Date.now()

        // Only refresh if we have an authenticated user
        if (state.materializeUser || state.booklyUser) {
          set({
            lastActivity: now,
            sessionExpiry: now + (24 * 60 * 60 * 1000) // 24 hours from now
          })
        }
      },

      clearError: () => set({ error: null }),

      checkAndCleanupExpiredSession: () => {
        const state = get()

        // If session is invalid, clean up auth state
        if (!state.isSessionValid() && (state.materializeUser || state.booklyUser)) {
          console.log('🧹 Session expired, cleaning up auth state')
          AuthService.clearAuthToken()
          set({
            userType: null,
            booklyUser: null,
            materializeUser: null,
            token: null,
            error: null,
            lastActivity: null,
            sessionExpiry: null
          })
        }
      },

      // Customer auth - uses mock or real API based on configuration
      async loginCustomer(payload) {
        set({ loading: true, error: null })

        // Helper function to set mock user session
        const setMockSession = (email: string, name: string) => {
          const mockToken = 'mock_token_' + Date.now()
          const now = Date.now()
          set({
            userType: 'customer',
            booklyUser: {
              id: 'mock_user_' + email.replace('@', '_at_'),
              email: email,
              name: name
            },
            token: mockToken,
            loading: false,
            error: null,
            lastActivity: now,
            sessionExpiry: now + (24 * 60 * 60 * 1000) // 24 hours
          })
          console.log('🎭 Mock customer login successful for:', email)
        }

        // Use mock authentication if enabled
        if (USE_MOCK_CUSTOMER_AUTH) {
          // Check if email exists in mock customers
          const mockCustomer = MOCK_CUSTOMERS[payload.email.toLowerCase()]

          if (mockCustomer) {
            // Validate password for known mock customers
            if (mockCustomer.password === payload.password) {
              setMockSession(payload.email, mockCustomer.name)
              return
            } else {
              set({ loading: false, error: 'Invalid password' })
              throw new Error('Invalid password')
            }
          } else {
            // For any other email, accept any password (for testing convenience)
            // In production, this would fail without a valid account
            const userName = payload.email.split('@')[0].replace(/[._]/g, ' ')
            const capitalizedName = userName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            setMockSession(payload.email, capitalizedName)
            return
          }
        }

        // Real API authentication
        try {
          const response = await AuthService.loginUser(payload)
          if (response.error) {
            throw new Error(response.error)
          }

          if (response.data?.access_token) {
            AuthService.setAuthToken(response.data.access_token)
            const now = Date.now()
            set({
              userType: 'customer',
              booklyUser: {
                id: 'user_' + payload.email,
                email: payload.email,
                name: payload.email.split('@')[0]
              },
              token: response.data.access_token,
              loading: false,
              error: null,
              lastActivity: now,
              sessionExpiry: now + (24 * 60 * 60 * 1000) // 24 hours
            })
          }
        } catch (e: any) {
          set({ loading: false, error: e?.message ?? 'Login failed' })
          throw e
        }
      },

      async registerCustomer(payload) {
        set({ loading: true, error: null })

        // Use mock registration if enabled
        if (USE_MOCK_CUSTOMER_AUTH) {
          // Simulate registration delay
          await new Promise(resolve => setTimeout(resolve, 500))

          // Check if email already exists in mock customers (simulate duplicate check)
          if (MOCK_CUSTOMERS[payload.email.toLowerCase()]) {
            set({ loading: false, error: 'Email already registered' })
            throw new Error('Email already registered')
          }

          // Mock successful registration
          console.log('🎭 Mock customer registration successful for:', payload.email)
          set({
            loading: false,
            error: null
          })

          // Note: In mock mode, user can login immediately without email verification
          return
        }

        // Real API registration
        try {
          const response = await AuthService.registerUser(payload)
          if (response.error) {
            throw new Error(response.error)
          }

          // Registration successful - user needs to verify email
          set({
            loading: false,
            error: null
          })

          // Note: User will need to verify email before they can login
        } catch (e: any) {
          set({ loading: false, error: e?.message ?? 'Registration failed' })
          throw e
        }
      },

      async verifyCustomer(payload) {
        set({ loading: true, error: null })

        // Use mock verification if enabled
        if (USE_MOCK_CUSTOMER_AUTH) {
          // Simulate verification delay
          await new Promise(resolve => setTimeout(resolve, 300))

          console.log('🎭 Mock customer verification successful for:', payload.email)
          set({ loading: false, error: null })
          return
        }

        // Real API verification
        try {
          const response = await AuthService.verifyUser(payload)
          if (response.error) {
            throw new Error(response.error)
          }

          set({ loading: false, error: null })
        } catch (e: any) {
          set({ loading: false, error: e?.message ?? 'Verification failed' })
          throw e
        }
      },

      logoutCustomer() {
        const { userType } = get()
        AuthService.clearAuthToken()
        set({
          booklyUser: null,
          token: null,
          error: null,
          lastActivity: null,
          sessionExpiry: null,
          ...(userType === 'customer' ? { userType: null } : {})
        })
      },

      // Admin login for business dashboard
      async loginAdmin(payload) {
        set({ loading: true, error: null })
        try {
          console.log('🔑 Attempting admin login for:', payload.email)
          const response = await AuthService.loginAdmin(payload)

          console.log('📊 Login API Response:', response)

          if (response.error) {
            console.error('❌ API returned error:', response.error)
            throw new Error(response.error)
          }

          if (response.data?.access_token && response.data?.user) {
            console.log('✅ Login successful, setting auth token')
            AuthService.setAuthToken(response.data.access_token)
            const now = Date.now()
            set({
              userType: 'business',
              materializeUser: {
                id: response.data.user.id,
                email: response.data.user.email,
                name: response.data.user.name,
                role: 'admin',
                isOwner: response.data.user.isOwner,
                business: response.data.user.business
              },
              token: response.data.access_token,
              loading: false,
              error: null,
              lastActivity: now,
              sessionExpiry: now + (24 * 60 * 60 * 1000) // 24 hours
            })
          } else {
            console.error('❌ No access token in response:', response)
            throw new Error('No access token received from server')
          }
        } catch (e: any) {
          console.error('❌ Admin login failed:', e)
          set({ loading: false, error: e?.message ?? 'Admin login failed' })
          throw e
        }
      },

      // For Materialize side, we rely on NextAuth. This setter lets us mirror session info in the store.
      setMaterializeUser(user) {
        set({ materializeUser: user, userType: user ? 'business' : get().userType, error: null })
      },

      logoutBusiness() {
        console.log('🧹 Clearing business auth state...')
        const { userType } = get()
        AuthService.clearAuthToken()

        // Clear localStorage to ensure complete logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('bookly-auth-store')
          // Also clear any nextauth items
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('nextauth')) {
              localStorage.removeItem(key)
            }
          })
        }

        // Reset to initial state
        set({
          userType: null,
          booklyUser: null,
          materializeUser: null,
          token: null,
          loading: false,
          error: null,
          lastActivity: null,
          sessionExpiry: null
        })

        // Force persistence to sync immediately
        if (typeof window !== 'undefined') {
          // Double-check that localStorage is cleared
          setTimeout(() => {
            localStorage.removeItem('bookly-auth-store')
          }, 50)
        }

        console.log('✅ Business auth state cleared')
      }
    }),
    {
      name: 'bookly-auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        booklyUser: state.booklyUser,
        materializeUser: state.materializeUser,
        userType: state.userType,
        token: state.token,
        lastActivity: state.lastActivity,
        sessionExpiry: state.sessionExpiry
      }),
      onRehydrateStorage: () => (state) => {
        // Restore token to API client after rehydration
        if (state?.token && (state?.booklyUser || state?.materializeUser)) {
          console.log('🔄 Restoring token to API client after store rehydration')
          AuthService.setAuthToken(state.token)
        }
      }
    }
  )
)
