'use client'

import Link from 'next/link'
import { Button } from '@/bookly/components/ui/button'
import { H1, P } from '@/bookly/components/atoms'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/bookly/components/ui/card'

export default function DemoPage() {
  return (
    <main className='min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900'>
      <Card className='w-full max-w-xl'>
        <CardHeader>
          <CardTitle>
            <H1 stringProps={{ plainText: 'Welcome to Bookly' }} />
          </CardTitle>
          <CardDescription>
            <P stringProps={{ plainText: 'Please login or create a new account to continue' }} />
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <Link href='/login' className='w-full'>
            <Button className='w-full text-lg' variant='default' size='lg'>
              Login
            </Button>
          </Link>
          <Link href='/register' className='w-full'>
            <Button className='w-full text-lg' variant='outline' size='lg'>
              Create Account
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
