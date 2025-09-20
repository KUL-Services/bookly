'use client'

import { AuthForm, Button } from '@/bookly/components/molecules'
import { PageProps } from '@/bookly/types'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'

export default function RegisterPage({ params }: PageProps) {
  const { lang: locale } = params
  const router = useRouter()
  const registerCustomer = useAuthStore(s => s.registerCustomer)

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-cyan-50/10 relative overflow-hidden'>
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/10 rounded-full blur-3xl animate-pulse' />
        <div className='absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-200/20 to-teal-200/10 rounded-full blur-3xl animate-pulse animation-delay-1000' />
      </div>

      <main className='container mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10'>
        <div className='w-full max-w-md mx-auto'>
          {/* Mobile-optimized header */}
          <div className='text-center mb-6 sm:mb-8 animate-in fade-in slide-in-from-top-4 duration-700'>
            <h1 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2'>
              Join Bookly
            </h1>
            <p className='text-gray-600 text-sm sm:text-base'>Create your account to start booking services</p>
          </div>

          {/* Form container with mobile-friendly styling */}
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-teal-100/50 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-6 duration-700 animation-delay-300'>
            <AuthForm
              type='register'
              onSubmit={async values => {
                const { firstName, lastName, email, password } = values as any
                await registerCustomer({ firstName, lastName, email, password })
                router.push(`/${locale}/landpage`)
              }}
            />
          </div>

          {/* Mobile-friendly footer */}
          <div className='text-center mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 animation-delay-600'>
            <p className='text-sm text-gray-600'>
              Already have an account?{' '}
              <button
                onClick={() => router.push(`/${locale}/customer/login`)}
                className='text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200'
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
