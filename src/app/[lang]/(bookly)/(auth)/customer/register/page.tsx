'use client'

import { useState, useEffect } from 'react'
import { AuthForm } from '@/bookly/components/molecules'
import { PageProps } from '@/bookly/types'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import initTranslations from '@/app/i18n/i18n'

export default function RegisterPage({ params }: PageProps) {
  const { lang: locale } = params
  const router = useRouter()
  const registerCustomer = useAuthStore(state => state.registerCustomer)
  const loading = useAuthStore(state => state.loading)
  const error = useAuthStore(state => state.error)
  const clearError = useAuthStore(state => state.clearError)
  const [t, setT] = useState<any>(() => (key: string) => key)

  useEffect(() => {
    const initializeTranslations = async () => {
      const { t: tFn } = await initTranslations(locale || 'en', ['common'])
      setT(() => tFn)
    }
    initializeTranslations()
  }, [locale])

  return (
    <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0a2c24] relative overflow-hidden font-sans'>
      <main className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10'>
        <div className='w-full max-w-md mx-auto'>
          {/* Mobile-optimized header */}
          <div className='text-center mb-6 sm:mb-8 animate-in fade-in slide-in-from-top-4 duration-700'>
            <h1 className='text-2xl sm:text-3xl font-bold text-[#0a2c24] dark:text-white mb-2'>
              {t('auth.register.title')}
            </h1>
            <p className='text-[#0a2c24]/70 dark:text-white/70 text-sm sm:text-base'>
              {t('auth.register.description')}
            </p>
          </div>

          {/* Form container with mobile-friendly styling */}
          <div className='bg-white/90 dark:bg-[#202c39]/90 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-[#0a2c24]/5 dark:border-white/5 p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-6 duration-700 animation-delay-300'>
            <AuthForm
              type='register'
              loading={loading}
              error={error}
              onClearError={clearError}
              onSubmit={async values => {
                try {
                  const { firstName, lastName, mobile, email, password } = values as any
                  await registerCustomer({ firstName, lastName, mobile, email, password })
                  // Redirect directly to verify page with email pre-filled
                  router.push(`/${locale}/customer/verify?email=${encodeURIComponent(email)}`)
                } catch (err) {
                  console.error('Registration failed:', err)
                  throw err
                }
              }}
            />
          </div>

          {/* Mobile-friendly footer */}
          <div className='text-center mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 animation-delay-600'>
            <p className='text-sm text-[#0a2c24]/70 dark:text-white/70'>
              {t('auth.register.haveAccount')}{' '}
              <button
                onClick={() => router.push(`/${locale}/customer/login`)}
                className='text-[#0a2c24] dark:text-[#77b6a3] hover:text-[#77b6a3] dark:hover:text-[#77b6a3]/80 font-medium transition-colors duration-200'
              >
                {t('auth.register.login')}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
