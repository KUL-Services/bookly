'use client'

import { useEffect } from 'react'
import { AuthService } from '@/lib/api'

const AuthInitializer = () => {
  useEffect(() => {
    // Initialize auth token from localStorage on app start
    AuthService.initializeAuth()
  }, [])

  return null
}

export default AuthInitializer