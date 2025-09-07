import { AuthForm } from '@/bookly/components/molecules'
import { PageProps } from '@/bookly/types'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function LoginPage({ params }: PageProps) {
  const { lang: locale } = params

  return (
    <main className='min-h-screen flex flex-col items-center justify-center p-4 relative'>
      <div className='absolute top-4 left-4'>
        <Link href='/demo' className='text-primary hover:underline'>
          ← Back to Demo
        </Link>
      </div>
      <AuthForm
        type='login'
        onSubmit={async values => {
          'use server'
          // Handle login submission here
          console.log('Login values:', values)
          // For demo purposes, redirect to demo page after login
          redirect('/demo')
        }}
      />
    </main>
  )
}
