'use client'

import { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { BrandedSpinner } from '@/bookly/components/atoms/branded-spinner'
import { BaseInput } from '@/bookly/components/atoms'
import { Button } from '@/bookly/components/molecules'
import { Card, CardContent } from '@/bookly/components/ui/card'
import { useAuthStore } from '@/stores/auth.store'
import type { PageProps } from '@/bookly/types'

export default function VerifyPage({ params }: PageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = params
  const verifyCustomer = useAuthStore(s => s.verifyCustomer)
  const loading = useAuthStore(s => s.loading)
  const error = useAuthStore(s => s.error)

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')

  // Pre-fill email from URL param (set by register page)
  useEffect(() => {
    const emailParam = searchParams?.get('email')
    if (emailParam) setEmail(decodeURIComponent(emailParam))
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await verifyCustomer({ email, code })
      router.push(`/${locale}/customer/login?verified=1`)
    } catch (err) {
      console.error('Verification failed:', err)
    }
  }

  return (
    <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0a2c24] flex items-center justify-center animate-in fade-in slide-in-from-top-4 duration-700 font-sans'>
      <div className='container mx-auto px-4 py-8'>
        <div className='w-full max-w-md mx-auto'>
          <Card className='shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150 bg-white dark:bg-[#202c39] border border-[#0a2c24]/10 dark:border-white/10'>
            <CardContent className='p-6'>
              <div className='text-center mb-6 animate-in fade-in slide-in-from-top-4 duration-500 delay-300'>
                <div className='mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0a2c24]/8 dark:bg-[#77b6a3]/15'>
                  <svg className='w-7 h-7 text-[#0a2c24] dark:text-[#77b6a3]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                  </svg>
                </div>
                <h1 className='text-2xl font-bold text-[#0a2c24] dark:text-white'>Verify Your Email</h1>
                <p className='text-[#0a2c24]/70 dark:text-white/70 mt-2 text-sm'>
                  We sent a verification code to your email. Enter it below to activate your account.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className='space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500'
              >
                <BaseInput
                  type='email'
                  placeholderProps={{ plainText: 'Email Address' }}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className='w-full'
                />

                <BaseInput
                  type='text'
                  placeholderProps={{ plainText: 'Verification Code' }}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                  className='w-full'
                  autoComplete='one-time-code'
                  inputMode='numeric'
                />

                {error && (
                  <div className='text-red-600 dark:text-red-400 text-sm text-center animate-in fade-in duration-300 rounded-xl bg-red-50 dark:bg-red-900/20 px-3 py-2'>
                    {error}
                  </div>
                )}

                <Button
                  type='submit'
                  buttonText={{
                    plainText: loading ? (
                      <div className='flex items-center justify-center gap-2'>
                        <BrandedSpinner size={16} color='inherit' sx={{ mr: 1 }} />
                        Verifying...
                      </div>
                    ) : (
                      'Verify Email'
                    )
                  }}
                  variant='contained'
                  className='w-full bg-[#0a2c24] hover:bg-[#0a2c24]/90 dark:bg-[#77b6a3] dark:hover:bg-[#77b6a3]/90 text-white dark:text-[#0a2c24] transition-all duration-300'
                  disabled={loading}
                />
              </form>

              <div className='text-center mt-5 space-y-2 animate-in fade-in duration-500 delay-700'>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  Didn't receive a code? Check your spam folder or{' '}
                  <button
                    type='button'
                    onClick={() => router.push(`/${locale}/customer/register`)}
                    className='text-[#0a2c24] dark:text-[#77b6a3] underline hover:no-underline'
                  >
                    register again
                  </button>
                </p>
                <Button
                  buttonText={{ plainText: 'Back to Login' }}
                  variant='text'
                  onClick={() => router.push(`/${locale}/customer/login`)}
                  className='text-[#0a2c24] dark:text-[#77b6a3] hover:text-[#77b6a3] dark:hover:text-[#77b6a3]/80 transition-colors duration-300'
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
