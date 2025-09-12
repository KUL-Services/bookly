'use client'

import { AuthForm, Button } from '@/bookly/components/molecules'
import { PageProps } from '@/bookly/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage({ params }: PageProps) {
  const { lang: locale } = params
  const router = useRouter()

  return (
    <div className='min-h-screen'>
      <main className='container mx-auto px-4 py-8'>
        <div className='w-1/3 mx-auto flex justify-center'>
          <AuthForm
            type='register'
            onSubmit={async values => {
              // 'use server'
              // Handle login submission here
              console.log('Login values:', values)
              // For demo purposes, redirect to demo page after login
              router.push('/demo')
            }}
          />
        </div>
      </main>
    </div>
  )
}
