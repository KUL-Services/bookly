'use client'

import { AuthForm, Button } from '@/bookly/components/molecules'
import { PageProps } from '@/bookly/types'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import initTranslations from '@/app/i18n/i18n'
import { useState, useEffect } from 'react'

export default function LoginPage({ params }: PageProps) {
  const router = useRouter()
  const { lang: locale } = params
  const loginCustomer = useAuthStore(state => state.loginCustomer)
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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-cyan-50/10 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 relative overflow-hidden'>
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/10 dark:from-teal-600/15 dark:to-cyan-600/8 rounded-full blur-3xl animate-pulse' />
        <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-200/20 to-teal-200/10 dark:from-emerald-600/15 dark:to-teal-600/8 rounded-full blur-3xl animate-pulse animation-delay-1000' />
      </div>

      <main className='container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10'>
        <div className='w-full max-w-md mx-auto'>
          {/* Mobile-optimized header */}
          <div className='text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700'>
            <h1 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2'>
              {t('auth.login.title')}
            </h1>
            <p className='text-gray-600 dark:text-gray-300 text-sm sm:text-base'>{t('auth.login.description')}</p>
          </div>

          {/* Form container with mobile-friendly styling */}
          <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-teal-100/50 dark:border-gray-700/50 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-6 duration-700 animation-delay-300'>
            <AuthForm
              type='login'
              loading={loading}
              error={error}
              onClearError={clearError}
              onSubmit={async (values: any) => {
                try {
                  const { email, password } = values
                  await loginCustomer({ email, password })
                  router.push(`/${locale}/landpage`)
                } catch (err) {
                  // Error handling is now managed by the AuthForm component
                  // It will either show field-specific errors or let the general error through
                  console.error('Login failed:', err)
                  throw err // Re-throw to let AuthForm handle it
                }
              }}
            />
          </div>

          {/* Mobile-friendly footer */}
          <div className='text-center mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 animation-delay-600'>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
              {t('auth.login.noAccount')}{' '}
              <button
                onClick={() => router.push(`/${locale}/customer/register`)}
                className='text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium transition-colors duration-200'
              >
                {t('auth.login.createAccount')}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

// <main className='min-h-screen flex flex-col items-center justify-center p-4 relative'>
//       <div className='absolute top-4 left-4'>
//         <Link href='/demo' className='text-primary hover:underline'>
//           ← Back to Demo
//         </Link>
//       </div>

//       <AuthForm
//         type='login'
//         onSubmit={async values => {
//           // 'use server'
//           // Handle login submission here
//           console.log('Login values:', values)
//           // For demo purposes, redirect to demo page after login
//           redirect('/demo')
//         }}
//       />
//     </main>
