'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { syncPushTokenForIdentity } from '@/lib/push/push-token-manager'

const PushTokenInitializer = () => {
  const token = useAuthStore(s => s.token)
  const userType = useAuthStore(s => s.userType)
  const customerId = useAuthStore(s => s.booklyUser?.id)
  const businessId = useAuthStore(s => s.materializeUser?.id)
  const syncInProgressRef = useRef(false)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryAttemptRef = useRef(0)

  const identity = userType === 'customer' ? customerId : userType === 'business' ? businessId : undefined
  const isAuthenticated = Boolean(token && identity)

  const clearRetry = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
  }, [])

  const syncToken = useCallback(async () => {
    if (!isAuthenticated || !identity || syncInProgressRef.current) return

    const scheduleRetry = () => {
      clearRetry()
      const delayMs = Math.min(30_000, 1_000 * 2 ** retryAttemptRef.current)
      retryAttemptRef.current += 1
      retryTimerRef.current = setTimeout(() => {
        void syncToken()
      }, delayMs)
    }

    syncInProgressRef.current = true
    try {
      const result = await syncPushTokenForIdentity(`${userType}:${identity}`)
      if (result === 'transient_error') {
        scheduleRetry()
        return
      }
      if (result === 'auth_error') {
        clearRetry()
        return
      }
      retryAttemptRef.current = 0
      clearRetry()
    } catch (error) {
      console.warn('Push token sync failed:', error)
      scheduleRetry()
    } finally {
      syncInProgressRef.current = false
    }
  }, [isAuthenticated, identity, userType, clearRetry])

  useEffect(() => {
    void syncToken()
  }, [syncToken])

  useEffect(() => {
    if (!isAuthenticated) return

    const onFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        void syncToken()
      }
    }

    window.addEventListener('focus', onFocusOrVisible)
    document.addEventListener('visibilitychange', onFocusOrVisible)

    return () => {
      window.removeEventListener('focus', onFocusOrVisible)
      document.removeEventListener('visibilitychange', onFocusOrVisible)
    }
  }, [isAuthenticated, syncToken])

  useEffect(() => {
    if (isAuthenticated) return
    retryAttemptRef.current = 0
    clearRetry()
  }, [isAuthenticated, clearRetry])

  useEffect(() => {
    return () => {
      clearRetry()
    }
  }, [clearRetry])

  return null
}

export default PushTokenInitializer
