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
    <div className='min-h-screen flex items-center justify-center'>
      <div className='container mx-auto px-4 py-8'>
        <div className='w-full max-w-md mx-auto'>
          <Card className='shadow-lg'>
            <CardContent className='p-6'>
              <div className='text-center mb-6'>
                <h1 className='text-2xl font-bold text-gray-900'>Verify Your Email</h1>
                <p className='text-gray-600 mt-2'>
                  We sent a verification code to your email address. Please enter it below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className='space-y-4'>
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

                {error && <div className='text-red-600 text-sm text-center'>{error}</div>}

                <Button
                  type='submit'
                  buttonText={{ plainText: loading ? 'Verifying...' : 'Verify Email' }}
                  variant='contained'
                  className='w-full bg-black hover:bg-gray-900 text-white'
                  disabled={loading}
                />
              </form>

              <div className='text-center mt-6'>
                <Button
                  buttonText={{ plainText: 'Back to Login' }}
                  variant='text'
                  onClick={() => router.push(`/${locale}/customer/login`)}
                  className='text-gray-600 hover:text-gray-900'
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
