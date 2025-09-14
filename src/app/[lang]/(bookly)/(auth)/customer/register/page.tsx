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
    <div className='min-h-screen'>
      <main className='container mx-auto px-4 py-8'>
        <div className='w-1/3 mx-auto flex justify-center'>
          <AuthForm
            type='register'
            onSubmit={async values => {
              const { firstName, lastName, email, password } = values as any
              await registerCustomer({ firstName, lastName, email, password })
              router.push(`/${locale}/profile`)
            }}
          />
        </div>
      </main>
    </div>
  )
}
