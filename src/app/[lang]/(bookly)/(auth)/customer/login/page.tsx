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
    <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0a2c24] relative overflow-hidden font-sans'>
      {/* Background Pattern Overlay */}
      <div className='absolute inset-0 bg-zerv-pattern opacity-10' />
      <main className='container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10'>
        <div className='w-full max-w-md mx-auto'>
          {/* Mobile-optimized header */}
          <div className='text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700'>
            <h1 className='text-2xl sm:text-3xl font-bold text-[#0a2c24] dark:text-white mb-2'>
              {t('auth.login.title')}
            </h1>
            <p className='text-[#0a2c24]/70 dark:text-white/70 text-sm sm:text-base'>{t('auth.login.description')}</p>
          </div>

          {/* Form container with mobile-friendly styling */}
          <div className='bg-white/90 dark:bg-[#202c39]/90 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-[#0a2c24]/5 dark:border-white/5 p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-6 duration-700 animation-delay-300'>
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
            <p className='text-sm text-[#0a2c24]/70 dark:text-white/70'>
              {t('auth.login.noAccount')}{' '}
              <button
                onClick={() => router.push(`/${locale}/customer/register`)}
                className='text-[#0a2c24] dark:text-[#77b6a3] hover:text-[#77b6a3] dark:hover:text-[#77b6a3]/80 font-medium transition-colors duration-200'
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
