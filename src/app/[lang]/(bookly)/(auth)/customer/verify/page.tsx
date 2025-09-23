'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/bookly/components/ui/card'
import { Button } from '@/bookly/components/molecules'
import { BaseInput } from '@/bookly/components/atoms'
import { useAuthStore } from '@/stores/auth.store'
import { PageProps } from '@/bookly/types'

export default function VerifyPage({ params }: PageProps) {
  const router = useRouter()
  const { lang: locale } = params
  const verifyCustomer = useAuthStore(s => s.verifyCustomer)
  const loading = useAuthStore(s => s.loading)
  const error = useAuthStore(s => s.error)

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await verifyCustomer({ email, code })
      // Redirect to login after successful verification
      router.push(`/${locale}/customer/login`)
    } catch (error) {
      console.error('Verification failed:', error)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center animate-in fade-in slide-in-from-top-4 duration-700'>
      <div className='container mx-auto px-4 py-8'>
        <div className='w-full max-w-md mx-auto'>
          <Card className='shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150'>
            <CardContent className='p-6'>
              <div className='text-center mb-6 animate-in fade-in slide-in-from-top-4 duration-500 delay-300'>
                <h1 className='text-2xl font-bold text-gray-900'>Verify Your Email</h1>
                <p className='text-gray-600 mt-2'>
                  We sent a verification code to your email address. Please enter it below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className='space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500'>
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
                />

                {error && <div className='text-red-600 text-sm text-center animate-in fade-in duration-300'>{error}</div>}

                <div className='relative'>
                  <Button
                    type='submit'
                    buttonText={{
                      plainText: loading ? (
                        <div className='flex items-center justify-center'>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Verifying...
                        </div>
                      ) : 'Verify Email'
                    }}
                    variant='contained'
                    className='w-full bg-black hover:bg-gray-900 text-white transition-all duration-300'
                    disabled={loading}
                  />
                </div>
              </form>

              <div className='text-center mt-6 animate-in fade-in duration-500 delay-700'>
                <Button
                  buttonText={{ plainText: 'Back to Login' }}
                  variant='text'
                  onClick={() => router.push(`/${locale}/customer/login`)}
                  className='text-gray-600 hover:text-gray-900 transition-colors duration-300'
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
