'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/bookly/components/ui/form'
import { Input } from '@/bookly/components/ui/input'
import { Button } from '@/bookly/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/bookly/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PageProps } from '@/bookly/types'
import { AuthService } from '@/lib/api/services/auth.service'
import { toast } from 'sonner'
import KulIcon from '@/bookly/components/atoms/kul-icon/kul-icon.component'
import { FontSize } from '@/bookly/constants/enums'

const resetPasswordSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    code: z.string().min(1, 'Reset code is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage({ params }: PageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = params
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: searchParams.get('email') || '',
      code: searchParams.get('code') || '',
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true)
    try {
      await AuthService.resetPasswordUser({
        email: data.email,
        code: data.code,
        password: data.password
      })
      toast.success('Password reset successful! You can now log in with your new password.')
      router.push(`/${locale}/customer/login`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen'>
      <main className='container mx-auto px-4 py-8'>
        <div className='w-1/3 mx-auto flex justify-center'>
          <Card className='w-full border border-gray-300'>
            <CardHeader className='space-y-1'>
              <CardTitle className='text-2xl font-bold text-center text-primary-800'>
                Create New Password
              </CardTitle>
              <CardDescription className='text-center'>
                Enter your reset code and create a new password for your account
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

                  <FormField
                    control={form.control}
                    name='code'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reset Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter the reset code from your email'
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder='Enter your new password'
                              {...field}
                              disabled={isLoading}
                            />
                            <button
                              type='button'
                              onClick={() => setShowPassword(!showPassword)}
                              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
                              disabled={isLoading}
                            >
                              {showPassword ? (
                                <KulIcon icon='lucide:eye-off' fontSize={FontSize.L} />
                              ) : (
                                <KulIcon icon='lucide:eye' fontSize={FontSize.L} />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder='Confirm your new password'
                              {...field}
                              disabled={isLoading}
                            />
                            <button
                              type='button'
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
                              disabled={isLoading}
                            >
                              {showConfirmPassword ? (
                                <KulIcon icon='lucide:eye-off' fontSize={FontSize.L} />
                              ) : (
                                <KulIcon icon='lucide:eye' fontSize={FontSize.L} />
                              )}
                            </button>
                          </div>
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
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </form>
              </Form>

              <div className='mt-6 text-center'>
                <Link
                  href={`/${locale}/customer/login`}
                  className='text-sm text-primary-800 hover:underline'
                >
                  Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}