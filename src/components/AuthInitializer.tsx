'use client'

import { useEffect } from 'react'
import { AuthService } from '@/lib/api'
import { useAuthStore } from '@/stores/auth.store'

const AuthInitializer = () => {
  const isSessionValid = useAuthStore(s => s.isSessionValid)
  const logoutCustomer = useAuthStore(s => s.logoutCustomer)
  const logoutBusiness = useAuthStore(s => s.logoutBusiness)
  const refreshSession = useAuthStore(s => s.refreshSession)
  const booklyUser = useAuthStore(s => s.booklyUser)
  const materializeUser = useAuthStore(s => s.materializeUser)

  useEffect(() => {
    // Only initialize auth token if we have a user in the store
    // This prevents re-initializing after logout
    if (booklyUser || materializeUser) {
      AuthService.initializeAuth()

      // Check session validity
      if (!isSessionValid()) {
        console.log('Session expired, logging out')
        if (booklyUser) logoutCustomer()
        if (materializeUser) logoutBusiness()
        return
      }

      // Refresh session if valid
      refreshSession()
    } else {
      // If no user in store, make sure no token is set in API client
      console.log('No user in store, clearing any lingering API tokens')
      AuthService.clearAuthToken()
    }

    // Set up activity tracking
    const handleActivity = () => {
      if ((booklyUser || materializeUser) && isSessionValid()) {
        refreshSession()
      }
    }

    // Track user activity for session management
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // Check session validity every 5 minutes
    const sessionCheck = setInterval(() => {
      if ((booklyUser || materializeUser) && !isSessionValid()) {
        console.log('Session expired during activity check, logging out')
        if (booklyUser) logoutCustomer()
        if (materializeUser) logoutBusiness()
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
      clearInterval(sessionCheck)
    }
  }, [booklyUser, materializeUser, isSessionValid, logoutCustomer, logoutBusiness, refreshSession])

  return null
}

export default AuthInitializer