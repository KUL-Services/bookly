'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AuthService } from '@/lib/api'
import type { LoginRequest, RegisterUserRequest, VerifyAccountRequest } from '@/lib/api'

export type UserType = 'customer' | 'business'

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar?: string
  role?: string
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

  // Actions
  setUserType: (type: UserType | null) => void

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

      setUserType: type => set({ userType: type }),

      // Customer auth with real API calls
      async loginCustomer(payload) {
        set({ loading: true, error: null })
        try {
          const response = await AuthService.loginUser(payload)
          if (response.error) {
            throw new Error(response.error)
          }

          if (response.data?.access_token) {
            AuthService.setAuthToken(response.data.access_token)
            set({
              userType: 'customer',
              booklyUser: {
                id: 'user_' + payload.email,
                email: payload.email,
                name: payload.email.split('@')[0]
              },
              token: response.data.access_token,
              loading: false,
              error: null
            })
          }
        } catch (e: any) {
          set({ loading: false, error: e?.message ?? 'Login failed' })
          throw e
        }
      },

      async registerCustomer(payload) {
        set({ loading: true, error: null })
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
        set({ booklyUser: null, token: null, error: null, ...(userType === 'customer' ? { userType: null } : {}) })
      },

      // Admin login for business dashboard
      async loginAdmin(payload) {
        set({ loading: true, error: null })
        try {
          const response = await AuthService.loginAdmin(payload)
          if (response.error) {
            throw new Error(response.error)
          }

          if (response.data?.access_token) {
            AuthService.setAuthToken(response.data.access_token)
            set({
              userType: 'business',
              materializeUser: {
                id: 'admin_' + payload.email,
                email: payload.email,
                name: payload.email.split('@')[0],
                role: 'admin'
              },
              token: response.data.access_token,
              loading: false,
              error: null
            })
          }
        } catch (e: any) {
          set({ loading: false, error: e?.message ?? 'Admin login failed' })
          throw e
        }
      },

      // For Materialize side, we rely on NextAuth. This setter lets us mirror session info in the store.
      setMaterializeUser(user) {
        set({ materializeUser: user, userType: user ? 'business' : get().userType, error: null })
      },

      logoutBusiness() {
        const { userType } = get()
        AuthService.clearAuthToken()
        set({ materializeUser: null, token: null, error: null, ...(userType === 'business' ? { userType: null } : {}) })
      }
    }),
    {
      name: 'auth-store',
      skipHydration: true,
      storage: createJSONStorage(() => localStorage)
    }
  )
)
