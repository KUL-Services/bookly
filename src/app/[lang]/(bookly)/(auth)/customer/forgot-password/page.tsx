'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/bookly/components/ui/form'
import { Input } from '@/bookly/components/ui/input'
import { Button } from '@/bookly/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/bookly/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageProps } from '@/bookly/types'
import { AuthService } from '@/lib/api/services/auth.service'
import { toast } from 'sonner'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage({ params }: PageProps) {
  const router = useRouter()
  const { lang: locale } = params
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    try {
      await AuthService.forgotPasswordUser(data.email)
      setIsSubmitted(true)
      toast.success('Password reset email sent! Please check your inbox.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className='min-h-screen'>
        <main className='container mx-auto px-4 py-8'>
          <div className='w-1/3 mx-auto flex justify-center'>
            <Card className='w-full border border-gray-300'>
              <CardHeader className='space-y-1'>
                <CardTitle className='text-2xl font-bold text-center text-primary-800'>
                  Check Your Email
                </CardTitle>
                <CardDescription className='text-center'>
                  We've sent a password reset link to your email address
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='text-center space-y-4'>
                  <div className='w-16 h-16 mx-auto bg-primary-200 rounded-full flex items-center justify-center'>
                    <svg className='w-8 h-8 text-primary-800' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                    </svg>
                  </div>
                  <p className='text-gray-600'>
                    Please check your email and click the reset link to continue. If you don't see the email, check your spam folder.
                  </p>
                  <div className='space-y-2'>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant='outline'
                      className='w-full'
                    >
                      Send Another Email
                    </Button>
                    <Link
                      href={`/${locale}/customer/login`}
                      className='block'
                    >
                      <Button variant='link' className='w-full text-primary-800'>
                        Back to Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className='min-h-screen'>
      <main className='container mx-auto px-4 py-8'>
        <div className='w-1/3 mx-auto flex justify-center'>
          <Card className='w-full border border-gray-300'>
            <CardHeader className='space-y-1'>
              <CardTitle className='text-2xl font-bold text-center text-primary-800'>
                Reset Your Password
              </CardTitle>
              <CardDescription className='text-center'>
                Enter your email address and we'll send you a link to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter your email address'
                            type='email'
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type='submit'
                    className='w-full text-white bg-primary-700 hover:bg-primary-800'
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              </Form>

              <div className='mt-6 text-center'>
                <Link
                  href={`/${locale}/customer/login`}
                  className='text-sm text-primary-800 hover:underline'
                >
                  Remember your password? Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}