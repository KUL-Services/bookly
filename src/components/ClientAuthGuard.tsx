'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/stores/auth.store'
import { AuthService } from '@/lib/api'
import type { Locale } from '@configs/i18n'
import type { ChildrenType } from '@core/types'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'

export default function ClientAuthGuard({ children, locale }: ChildrenType & { locale: Locale }) {
  const { data: session, status } = useSession()
  const { materializeUser, booklyUser, userType, token, isSessionValid, checkAndCleanupExpiredSession, refreshSession } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [hasHydrated, setHasHydrated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Initialize auth from stored token
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token')
      if (storedToken) {
        // Initialize API client with stored token
        AuthService.initializeAuth()
        console.log('🔄 Initialized auth with stored token')
      } else {
        console.log('❌ No stored token found')
      }
    }
  }, [])

  useEffect(() => {
    // Wait for either NextAuth session to load or store to have data
    if (status !== 'loading' && typeof window !== 'undefined') {
      // Check if store has persisted data (user or token)
      const storedData = localStorage.getItem('bookly-auth-store')
      if (storedData || materializeUser || booklyUser || token) {
        setHasHydrated(true)
      }

      // Give a reasonable timeout to ensure hydration
      const timer = setTimeout(() => {
        setHasHydrated(true)
        setIsLoading(false)
      }, 200)

      if (hasHydrated) {
        // Check for expired sessions and clean up if needed
        checkAndCleanupExpiredSession()

        // Refresh session if still valid
        if (isSessionValid()) {
          refreshSession()
        }

        setIsLoading(false)
        clearTimeout(timer)
      }

      return () => clearTimeout(timer)
    }
  }, [status, materializeUser, booklyUser, token, hasHydrated, checkAndCleanupExpiredSession, refreshSession, isSessionValid])

  // Show loading while NextAuth and auth store are initializing
  if (status === 'loading' || isLoading) {
    return <div>Loading...</div>
  }

  // Check if user is authenticated via either method and session is valid
  const isAuthenticated = Boolean(
    session?.user || // NextAuth session
    (materializeUser && isSessionValid()) || // API-based business auth with valid session
    (booklyUser && isSessionValid()) // API-based customer auth with valid session
  )

  // Don't redirect public bookly pages to login
  const isBooklyPublicPage = pathname.includes('/landpage') ||
                            pathname.includes('/search') ||
                            pathname.includes('/business/') ||
                            pathname.includes('/service/') ||
                            pathname.includes('/category/') ||
                            pathname.includes('/customer/login') ||
                            pathname.includes('/customer/register')

  if (isBooklyPublicPage || isAuthenticated) {
    return <>{children}</>
  }

  // Redirect to login if not authenticated
  return <AuthRedirect lang={locale} />
}