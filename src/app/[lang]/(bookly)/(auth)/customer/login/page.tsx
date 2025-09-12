'use client'

import { AuthForm, Button } from '@/bookly/components/molecules'
import { PageProps } from '@/bookly/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage({ params }: PageProps) {
  const router = useRouter()
  const { lang: locale } = params

  return (
    <div className='min-h-screen'>
      <main className='container mx-auto px-4 py-8'>
        <div className='absolute top-4 left-4'></div>
        <div className='w-1/3 mx-auto flex justify-center'>
          <AuthForm
            type='login'
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
