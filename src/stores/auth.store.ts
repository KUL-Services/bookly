'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
  loginCustomer: (payload: { email: string; password: string }) => Promise<void>
  registerCustomer: (payload: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => Promise<void>
  logoutCustomer: () => void

  // Materialize
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

      // In a real app, replace with API calls for Bookly auth
      async loginCustomer({ email, password }) {
        set({ loading: true, error: null })
        try {
          // Simulate a successful login
          await new Promise(res => setTimeout(res, 300))
          set({
            userType: 'customer',
            booklyUser: { id: 'cust_' + email, email, name: email.split('@')[0] },
            loading: false,
            error: null
          })
        } catch (e: any) {
          set({ loading: false, error: e?.message ?? 'Login failed' })
          throw e
        }
      },

      async registerCustomer({ firstName, lastName, email, password }) {
        set({ loading: true, error: null })
        try {
          // Simulate a successful registration
          await new Promise(res => setTimeout(res, 400))
          set({
            userType: 'customer',
            booklyUser: { id: 'cust_' + email, email, name: `${firstName} ${lastName}` },
            loading: false,
            error: null
          })
        } catch (e: any) {
          set({ loading: false, error: e?.message ?? 'Registration failed' })
          throw e
        }
      },

      logoutCustomer() {
        const { userType } = get()
        set({ booklyUser: null, token: null, error: null, ...(userType === 'customer' ? { userType: null } : {}) })
      },

      // For Materialize side, we rely on NextAuth. This setter lets us mirror session info in the store.
      setMaterializeUser(user) {
        set({ materializeUser: user, userType: user ? 'business' : get().userType, error: null })
      },

      logoutBusiness() {
        const { userType } = get()
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

