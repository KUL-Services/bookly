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
  const { materializeUser, booklyUser, userType, token } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
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

      // Wait a bit for Zustand hydration
      setTimeout(() => {
        setIsLoading(false)
      }, 100)
    }
  }, [])

  // Show loading while NextAuth and auth store are initializing
  if (status === 'loading' || isLoading) {
    return <div>Loading...</div>
  }

  // Check if user is authenticated via either method
  const isAuthenticated = Boolean(
    session?.user || // NextAuth session
    materializeUser || // API-based business auth
    booklyUser // API-based customer auth
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