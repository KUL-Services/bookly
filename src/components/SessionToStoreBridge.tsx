'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/stores/auth.store'

export default function SessionToStoreBridge() {
  const { data, status } = useSession()
  const { materializeUser, setMaterializeUser, token } = useAuthStore()

  useEffect(() => {
    // Wait for NextAuth to finish loading
    if (status === 'loading') {
      return
    }

    // If we already have API auth with business data and a token, don't interfere
    if (materializeUser?.business && token) {
      console.log('🔐 Preserving API auth - business data exists with token')
      return
    }

    // Only update if we have a NextAuth session but no API auth
    if (data?.user && !token) {
      console.log('🔄 Setting NextAuth user to store')
      setMaterializeUser({
        id: (data.user as any).id ?? data.user.email ?? 'business',
        email: data.user.email ?? 'unknown@business',
        name: data.user.name ?? undefined,
        avatar: (data.user as any).image ?? undefined
      })
    } else if (!data?.user && !token) {
      // Clear user only if no API auth exists
      console.log('🧹 Clearing user from store')
      setMaterializeUser(null)
    }
  }, [data, status, materializeUser?.business, token, setMaterializeUser])

  return null
}

