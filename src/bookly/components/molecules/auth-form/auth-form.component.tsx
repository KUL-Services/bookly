'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/bookly/components/ui/form'
import { Input } from '@/bookly/components/ui/input'
import { Button } from '@/bookly/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/bookly/components/ui/card'
import { Checkbox } from '@/bookly/components/ui/checkbox'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import KulIcon from '@/bookly/components/atoms/kul-icon/kul-icon.component'
import { FontSize } from '@/bookly/constants/enums'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional()
})

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
    terms: z.boolean().refine(value => value, 'You must accept the terms and conditions')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })

type AuthFormProps = {
  type: 'login' | 'register'
  onSubmit: (values: z.infer<typeof loginSchema> | z.infer<typeof registerSchema>) => void
}

export function AuthForm({ type, onSubmit }: AuthFormProps) {
  const { t } = useTranslation()
  const schema = type === 'login' ? loginSchema : registerSchema
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      terms: false,
      ...(type === 'register' ? { confirmPassword: '' } : {})
    }
  })

  const isLogin = type === 'login'

  return (
    <Card className='w-full  border border-gray-300'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold text-center'>
          {isLogin ? t('auth.login.title') : 'Create your account'}
        </CardTitle>
        <CardDescription className='text-center'>
          {isLogin ? t('auth.login.description') : 'Join Bookly and start booking services'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {!isLogin && (
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder='First name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='lastName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder='Last name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter your email' type='email' {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input type={showPassword ? 'text' : 'password'} placeholder='Create a password' {...field} />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
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

            {!isLogin && (
              <>
                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder='Confirm your password'
                            {...field}
                          />
                          <button
                            type='button'
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
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

                <FormField
                  control={form.control}
                  name='terms'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>
                          I agree to the{' '}
                          <Link href='/terms' className='text-teal-500 hover:underline'>
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href='/privacy' className='text-teal-500  hover:underline'>
                            Privacy Policy
                          </Link>
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </>
            )}

            {isLogin && (
              <div className='flex items-center justify-between'>
                <FormField
                  control={form.control}
                  name='rememberMe'
                  render={({ field }) => (
                    <FormItem className='flex items-center space-x-2'>
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className='text-sm'>Remember me</FormLabel>
                    </FormItem>
                  )}
                />
                <Link href='/customer/forgot-password' className='text-sm text-primary hover:underline'>
                  Forgot your password?
                </Link>
              </div>
            )}

            <Button type='submit' className='w-full text-teal-50 bg-teal-500 hover:bg-teal-600'>
              {isLogin ? 'Log in' : 'Create account'}
            </Button>
          </form>
        </Form>

        <div className='relative my-6'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300' />
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='bg-background px-2 text-muted-foreground'>Or continue with</span>
          </div>
        </div>

        {/* <div className='grid grid-cols-2 gap-4'>
          <Button variant='outline' type='button' className='w-full border border-gray-300'>
            <KulIcon icon='flat-color-icons:google' className='mr-2' />
            Google
          </Button>
          <Button variant='outline' type='button' className='w-full border border-gray-300'>
            <KulIcon icon='logos:facebook' className='mr-2' />
            Facebook
          </Button>
        </div> */}
      </CardContent>

      <CardFooter>
        <div className='text-sm text-muted-foreground text-center w-full'>
          {isLogin ? (
            <>
              {t('auth.login.noAccount')}{' '}
              <Link href='/customer/register' className='text-teal-500  hover:underline'>
                {t('auth.login.createAccount')}
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href='/customer/login' className='text-teal-500 hover:underline'>
                Log in
              </Link>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
