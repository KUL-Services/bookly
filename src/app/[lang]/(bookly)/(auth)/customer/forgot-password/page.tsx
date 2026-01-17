'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/bookly/components/ui/form'
import { Input } from '@/bookly/components/ui/input'
import { Button } from '@/bookly/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/bookly/components/ui/card'
import Link from 'next/link'
import { PageProps } from '@/bookly/types'
import { AuthService } from '@/lib/api/services/auth.service'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage({ params }: PageProps) {
  const { lang: locale } = params
  const { t } = useTranslation()
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
      <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0a2c24] font-sans'>
        <main className='container mx-auto px-4 py-8'>
          <div className='w-full max-w-md mx-auto flex justify-center'>
            <Card className='w-full border border-[#0a2c24]/10 dark:border-white/10 bg-white dark:bg-[#202c39]'>
              <CardHeader className='space-y-1'>
                <CardTitle className='text-2xl font-bold text-center text-[#0a2c24] dark:text-white'>
                  {t('auth.forgotPassword.successTitle')}
                </CardTitle>
                <CardDescription className='text-center text-[#0a2c24]/70 dark:text-white/70'>
                  {t('auth.forgotPassword.successDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='text-center space-y-4'>
                  <div className='w-16 h-16 mx-auto bg-[#77b6a3]/20 dark:bg-[#77b6a3]/10 rounded-full flex items-center justify-center'>
                    <svg
                      className='w-8 h-8 text-[#77b6a3]'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                  <p className='text-[#0a2c24]/70 dark:text-white/70'>{t('auth.forgotPassword.checkSpam')}</p>
                  <div className='space-y-2'>
                    <Button onClick={() => setIsSubmitted(false)} variant='outline' className='w-full'>
                      {t('auth.forgotPassword.sendAnother')}
                    </Button>
                    <Link href={`/${locale}/customer/login`} className='block'>
                      <Button variant='link' className='w-full text-[#0a2c24] dark:text-[#77b6a3]'>
                        {t('auth.forgotPassword.backToLogin')}
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
    <div className='min-h-screen bg-[#f7f8f9] dark:bg-[#0a2c24] font-sans'>
      <main className='container mx-auto px-4 py-8'>
        <div className='w-full max-w-md mx-auto flex justify-center'>
          <Card className='w-full border border-[#0a2c24]/10 dark:border-white/10 bg-white dark:bg-[#202c39]'>
            <CardHeader className='space-y-1'>
              <CardTitle className='text-2xl font-bold text-center text-[#0a2c24] dark:text-white'>
                {t('auth.forgotPassword.title')}
              </CardTitle>
              <CardDescription className='text-center text-[#0a2c24]/70 dark:text-white/70'>
                {t('auth.forgotPassword.description')}
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
                        <FormLabel>{t('auth.forgotPassword.emailLabel')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('auth.forgotPassword.emailPlaceholder')}
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
                    className='w-full text-white bg-[#0a2c24] hover:bg-[#0a2c24]/90 dark:bg-[#77b6a3] dark:hover:bg-[#77b6a3]/90 dark:text-[#0a2c24]'
                    disabled={isLoading}
                  >
                    {isLoading ? t('auth.forgotPassword.sending') : t('auth.forgotPassword.submitButton')}
                  </Button>
                </form>
              </Form>

              <div className='mt-6 text-center'>
                <Link
                  href={`/${locale}/customer/login`}
                  className='text-sm text-[#0a2c24] dark:text-[#77b6a3] hover:underline'
                >
                  {t('auth.forgotPassword.rememberPassword')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
