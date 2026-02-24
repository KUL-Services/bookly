'use client'

import { AuthForm } from '@/bookly/components/molecules'
import { PageProps } from '@/bookly/types'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import initTranslations from '@/app/i18n/i18n'
import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'

export default function LoginPage({ params }: PageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = params
  const loginCustomer = useAuthStore(state => state.loginCustomer)
  const loading = useAuthStore(state => state.loading)
  const error = useAuthStore(state => state.error)
  const clearError = useAuthStore(state => state.clearError)
  const [t, setT] = useState<any>(() => (key: string) => key)

  // Set when coming from a successful verification
  const justVerified = searchParams?.get('verified') === '1'

  // Capture the email that triggered an "unverified" error so we can link to verify
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)

  useEffect(() => {
    const initializeTranslations = async () => {
      const { t: tFn } = await initTranslations(locale || 'en', ['common'])
      setT(() => tFn)
    }
    initializeTranslations()
  }, [locale])

  return (
    <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0a2c24] relative overflow-hidden font-sans'>
      <main className='container mx-auto px-4 sm:px-6 py-4 sm:py-6 relative z-10'>
        <div className='w-full max-w-md mx-auto'>
          <div className='text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700'>
            <h1 className='text-2xl sm:text-3xl font-bold text-[#0a2c24] dark:text-white mb-2'>
              {t('auth.login.title')}
            </h1>
            <p className='text-[#0a2c24]/70 dark:text-white/70 text-sm sm:text-base'>{t('auth.login.description')}</p>
          </div>

          {justVerified && (
            <div className='mb-4 flex items-center gap-2 rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-700 dark:text-green-400 animate-in fade-in duration-500'>
              <CheckCircle className='h-4 w-4 shrink-0' />
              <span>Email verified! You can now log in.</span>
            </div>
          )}

          {unverifiedEmail && (
            <div className='mb-4 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400 animate-in fade-in duration-500'>
              <p className='font-medium'>Your email is not verified yet.</p>
              <button
                onClick={() =>
                  router.push(`/${locale}/customer/verify?email=${encodeURIComponent(unverifiedEmail)}`)
                }
                className='mt-1 underline hover:no-underline font-semibold'
              >
                Click here to verify your email →
              </button>
            </div>
          )}

          <div className='bg-white/90 dark:bg-[#202c39]/90 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-[#0a2c24]/5 dark:border-white/5 p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-6 duration-700 animation-delay-300 relative overflow-hidden'>
            <AuthForm
              type='login'
              loading={loading}
              error={error}
              onClearError={() => {
                clearError()
                setUnverifiedEmail(null)
              }}
              onSubmit={async (values: any) => {
                try {
                  const { email, password } = values
                  setUnverifiedEmail(null)
                  await loginCustomer({ email, password })

                  const redirect = searchParams?.get('redirect')
                  if (redirect) {
                    router.push(`/${locale}${decodeURIComponent(redirect)}`)
                  } else {
                    router.push(`/${locale}/landpage`)
                  }
                } catch (err: any) {
                  const msg = (err?.message || '').toLowerCase()
                  if (
                    msg.includes('account not verified') ||
                    msg.includes('please verify') ||
                    msg.includes('email not verified')
                  ) {
                    setUnverifiedEmail((values as any).email)
                  }
                  throw err
                }
              }}
            />
          </div>

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
