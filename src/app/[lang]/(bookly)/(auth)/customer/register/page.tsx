'use client'

import * as React from 'react'
import { AuthForm, Button } from '@/bookly/components/molecules'
import { PageProps } from '@/bookly/types'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import initTranslations from '@/app/i18n/i18n'
import { useState, useEffect } from 'react'

export default function RegisterPage({ params }: PageProps) {
  const { lang: locale } = params
  const router = useRouter()
  const registerCustomer = useAuthStore(state => state.registerCustomer)
  const loading = useAuthStore(state => state.loading)
  const error = useAuthStore(state => state.error)
  const clearError = useAuthStore(state => state.clearError)
  const [registrationSuccess, setRegistrationSuccess] = React.useState(false)
  const [t, setT] = useState<any>(() => (key: string) => key)

  useEffect(() => {
    const initializeTranslations = async () => {
      const { t: tFn } = await initTranslations(locale || 'en', ['common'])
      setT(() => tFn)
    }
    initializeTranslations()
  }, [locale])

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden font-sans'>
      <main className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10'>
        <div className='w-full max-w-md mx-auto'>
          {/* Mobile-optimized header */}
          <div className='text-center mb-6 sm:mb-8 animate-in fade-in slide-in-from-top-4 duration-700'>
            <h1 className='text-2xl sm:text-3xl font-bold text-primary-800 dark:text-white mb-2'>
              {t('auth.register.title')}
            </h1>
            <p className='text-gray-600 dark:text-gray-300 text-sm sm:text-base'>{t('auth.register.description')}</p>
          </div>

          {/* Form container with mobile-friendly styling */}
          <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-primary-100/50 dark:border-gray-700/50 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-6 duration-700 animation-delay-300'>
            {registrationSuccess ? (
              <div className='text-center space-y-4'>
                <div className='w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center'>
                  <svg
                    className='w-8 h-8 text-green-600 dark:text-green-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>Registration Successful!</h3>
                <p className='text-gray-600 dark:text-gray-300 text-sm'>
                  Your account has been created. You can now login with your credentials.
                </p>
                <button
                  onClick={() => router.push(`/${locale}/customer/login`)}
                  className='w-full py-3 px-4 bg-primary-700 hover:bg-primary-800 text-white font-medium rounded-lg transition-colors duration-200'
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <AuthForm
                type='register'
                loading={loading}
                error={error}
                onClearError={clearError}
                onSubmit={async values => {
                  try {
                    const { firstName, lastName, mobile, email, password } = values as any
                    await registerCustomer({ firstName, lastName, mobile, email, password })
                    setRegistrationSuccess(true)
                  } catch (err) {
                    console.error('Registration failed:', err)
                    setRegistrationSuccess(false)
                    throw err
                  }
                }}
              />
            )}
          </div>

          {/* Mobile-friendly footer */}
          <div className='text-center mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 animation-delay-600'>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
              {t('auth.register.haveAccount')}{' '}
              <button
                onClick={() => router.push(`/${locale}/customer/login`)}
                className='text-primary-800 dark:text-sage-400 hover:text-primary-900 dark:hover:text-sage-300 font-medium transition-colors duration-200'
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
