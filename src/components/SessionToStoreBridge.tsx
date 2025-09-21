'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/stores/auth.store'

export default function SessionToStoreBridge() {
  const { data } = useSession()
  const { materializeUser, setMaterializeUser } = useAuthStore()

  useEffect(() => {
    // If we already have API auth with business data, don't interfere
    if (materializeUser?.business) {
      return
    }

    if (data?.user) {
      setMaterializeUser({
        id: (data.user as any).id ?? data.user.email ?? 'business',
        email: data.user.email ?? 'unknown@business',
        name: data.user.name ?? undefined,
        avatar: (data.user as any).image ?? undefined
      })
    } else {
      setMaterializeUser(null)
    }
  }, [data]) // Only depend on NextAuth session changes

  return null
}

