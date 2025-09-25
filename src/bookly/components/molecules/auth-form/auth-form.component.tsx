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
import { Alert, AlertDescription } from '@/bookly/components/ui/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { suppressZodConsoleErrors, restoreConsoleErrors } from '@/bookly/lib/suppress-console-errors'

// More lenient client-side validation - only check for required fields
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'), // Remove min length for client validation
  rememberMe: z.boolean().optional()
})

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(1, 'Last name is required').min(2, 'Last name must be at least 2 characters'),
    mobile: z.string().min(1, 'Mobile number is required').regex(/^\+[1-9]\d{1,14}$/, 'Please enter a valid mobile number with country code (e.g., +1234567890)'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    terms: z.boolean().refine(value => value === true, {
      message: 'You must accept the terms and conditions'
    })
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })

type AuthFormProps = {
  type: 'login' | 'register'
  onSubmit: (values: z.infer<typeof loginSchema> | z.infer<typeof registerSchema>) => void
  loading?: boolean
  error?: string | null
  successMessage?: string | null
  onClearError?: () => void
}


export function AuthForm({ type, onSubmit, loading = false, error, successMessage, onClearError }: AuthFormProps) {
  const { t } = useTranslation()
  const schema = type === 'login' ? loginSchema : registerSchema
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  // Suppress Zod console errors
  React.useEffect(() => {
    suppressZodConsoleErrors()
    return () => {
      restoreConsoleErrors()
    }
  }, [])

  const form = useForm<z.infer<typeof schema>>({
    resolver: type === 'login' ? undefined : zodResolver(schema), // Disable Zod for login
    mode: 'onSubmit', // Changed from 'onTouched' to 'onSubmit' to prevent validation on every change
    reValidateMode: 'onSubmit', // Only revalidate on submit
    defaultValues: {
      firstName: '',
      lastName: '',
      mobile: '',
      email: '',
      password: '',
      terms: false,
      ...(type === 'register' ? { confirmPassword: '' } : {})
    }
  })

  // Clear server errors when user starts typing
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && form.formState.errors[name]?.type === 'server') {
        form.clearErrors(name as keyof typeof value)
        // Also clear general error when user starts fixing field errors
        if (onClearError) {
          onClearError()
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch, form.clearErrors, onClearError])

  const handleSubmit = async (values: any) => {
    try {
      // Clear any existing errors before submission
      if (onClearError) {
        onClearError()
      }

      // Perform additional client-side validation for login only
      if (type === 'login') {
        const errors: { [key: string]: string } = {}

        if (!values.email || !values.email.trim()) {
          errors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
          errors.email = 'Please enter a valid email address'
        }

        if (!values.password || !values.password.trim()) {
          errors.password = 'Password is required'
        } else if (values.password.length < 8) {
          errors.password = 'Password must be at least 8 characters'
        }

        // Set field errors if any
        Object.keys(errors).forEach(field => {
          form.setError(field as keyof typeof values, {
            type: 'manual',
            message: errors[field]
          })
        })

        // Don't proceed if there are validation errors
        if (Object.keys(errors).length > 0) {
          return
        }
      }

      await onSubmit(values)
    } catch (error) {
      // Handle server-side validation errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()

        // Map common server errors to field-specific validation errors
        if (errorMessage.includes('invalid email or password') ||
            errorMessage.includes('invalid credentials') ||
            errorMessage.includes('incorrect password') ||
            errorMessage.includes('wrong password') ||
            errorMessage.includes('password is incorrect') ||
            errorMessage.includes('authentication failed')) {
          // For "Invalid email or password" - show on password field to be consistent
          form.setError('password', {
            type: 'server',
            message: error.message // Use the exact API message
          })
          return // Don't show general error if we have field-specific error
        }

        if (errorMessage.includes('user not found') ||
            errorMessage.includes('email not found') ||
            errorMessage.includes('no account found') ||
            errorMessage.includes('invalid email')) {
          form.setError('email', {
            type: 'server',
            message: 'No account found with this email address.'
          })
          return // Don't show general error if we have field-specific error
        }

        if (errorMessage.includes('account not verified') ||
            errorMessage.includes('please verify') ||
            errorMessage.includes('email not verified')) {
          form.setError('email', {
            type: 'server',
            message: 'Please verify your email address before logging in.'
          })
          return // Don't show general error if we have field-specific error
        }

        if (errorMessage.includes('account locked') ||
            errorMessage.includes('account disabled') ||
            errorMessage.includes('account suspended')) {
          form.setError('email', {
            type: 'server',
            message: 'This account has been locked or disabled. Please contact support.'
          })
          return // Don't show general error if we have field-specific error
        }

        // For registration-specific errors
        if (errorMessage.includes('email already exists') ||
            errorMessage.includes('email already taken') ||
            errorMessage.includes('user already exists')) {
          form.setError('email', {
            type: 'server',
            message: 'An account with this email already exists. Try logging in instead.'
          })
          return // Don't show general error if we have field-specific error
        }

        console.error('Form submission error:', error)
      }
    }
  }

  const isLogin = type === 'login'

  return (
    <Card className='w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold text-center text-gray-900 dark:text-white'>
          {isLogin ? t('auth.login.title') : 'Create your account'}
        </CardTitle>
        <CardDescription className='text-center text-gray-600 dark:text-gray-300'>
          {isLogin ? t('auth.login.description') : 'Join Bookly and start booking services'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && !form.formState.errors.email && !form.formState.errors.password && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              {onClearError && (
                <button
                  type="button"
                  onClick={onClearError}
                  className="ml-2 text-sm underline hover:no-underline"
                >
                  Dismiss
                </button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, (errors) => {
            console.log('Form validation errors:', errors)
            // Handle form validation errors here if needed
          })} className='space-y-4'>
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

            {!isLogin && (
              <FormField
                control={form.control}
                name='mobile'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile number</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., +1234567890' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name='email'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className={fieldState.error ? 'text-red-600 dark:text-red-400' : ''}>
                    Email address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter your email'
                      type='email'
                      {...field}
                      className={fieldState.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 dark:text-red-400 text-sm mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className={fieldState.error ? 'text-red-600 dark:text-red-400' : ''}>
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                        {...field}
                        className={fieldState.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      >
                        {showPassword ? (
                          <KulIcon icon='lucide:eye-off' fontSize={FontSize.L} />
                        ) : (
                          <KulIcon icon='lucide:eye' fontSize={FontSize.L} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-600 dark:text-red-400 text-sm mt-1" />
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
                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
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
                          <Link href='/terms' className='text-teal-500 dark:text-teal-400 hover:underline'>
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href='/privacy' className='text-teal-500 dark:text-teal-400 hover:underline'>
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
                <Link href='/customer/forgot-password' className='text-sm text-teal-500 dark:text-teal-400 hover:underline'>
                  Forgot your password?
                </Link>
              </div>
            )}

            <Button
              type='submit'
              className='w-full text-teal-50 bg-teal-500 hover:bg-teal-600'
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Log in' : 'Create account'
              )}
            </Button>
          </form>
        </Form>

        <div className='relative my-6'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-gray-300 dark:border-gray-600' />
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='bg-white dark:bg-gray-800 px-2 text-gray-600 dark:text-gray-300'>Or continue with</span>
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
        <div className='text-sm text-gray-600 dark:text-gray-300 text-center w-full'>
          {isLogin ? (
            <>
              {t('auth.login.noAccount')}{' '}
              <Link href='/customer/register' className='text-teal-500 dark:text-teal-400 hover:underline'>
                {t('auth.login.createAccount')}
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href='/customer/login' className='text-teal-500 dark:text-teal-400 hover:underline'>
                Log in
              </Link>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
