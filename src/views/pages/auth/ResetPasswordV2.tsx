'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { object, string, email, pipe, nonEmpty, minLength } from 'valibot'
import type { SubmitHandler } from 'react-hook-form'
import type { InferInput } from 'valibot'
import classnames from 'classnames'

// Type Imports
import type { Locale } from '@configs/i18n'
import type { Mode } from '@core/types'

// Component Imports
import DirectionalIcon from '@components/DirectionalIcon'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// API Imports
import { AuthService } from '@/lib/api/services/auth.service'

type FormData = InferInput<typeof schema>

const schema = object({
  email: pipe(string(), nonEmpty('This field is required'), email('Please enter a valid email address')),
  code: pipe(string(), nonEmpty('Reset code is required')),
  password: pipe(string(), nonEmpty('This field is required'), minLength(8, 'Password must be at least 8 characters')),
  confirmPassword: pipe(string(), nonEmpty('This field is required'), minLength(8, 'Password must be at least 8 characters'))
})

const ResetPasswordV2 = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorState, setErrorState] = useState<string | null>(null)

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-3-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-3-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-reset-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-reset-password-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-reset-password-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-reset-password-light-border.png'

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: searchParams.get('email') || '',
      code: searchParams.get('code') || '',
      password: '',
      confirmPassword: ''
    }
  })

  const watchedPassword = watch('password')

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      setErrorState("Passwords don't match")
      return
    }

    setIsLoading(true)
    setErrorState(null)
    try {
      await AuthService.resetPasswordAdmin({
        email: data.email,
        code: data.code,
        password: data.password
      })
      router.push(getLocalizedUrl('/login?message=password-reset-success', locale as Locale))
    } catch (error: any) {
      setErrorState(error?.message || 'Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <div className='pli-6 max-lg:mbs-40 lg:mbe-24'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[703px] max-is-full bs-auto'
          />
        </div>
        <img src={authBackground} className='absolute z-[-1] bottom-[4%] is-full max-md:hidden' />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/', locale as Locale)}
          className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div>
            <Typography variant='h4'>Reset Password 🔒</Typography>
            <Typography className='mbs-1'>
              Enter your email, reset code, and new password to reset your account password
            </Typography>
          </div>
          {errorState && (
            <Alert severity='error' className='mbs-2'>
              {errorState}
            </Alert>
          )}
          <form
            noValidate
            autoComplete='off'
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col gap-5'
          >
            <Controller
              name='email'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Email'
                  type='email'
                  disabled={isLoading}
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState && setErrorState(null)
                  }}
                  {...(errors.email && { error: true, helperText: errors.email.message })}
                />
              )}
            />
            <Controller
              name='code'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Reset Code'
                  disabled={isLoading}
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState && setErrorState(null)
                  }}
                  {...(errors.code && { error: true, helperText: errors.code.message })}
                />
              )}
            />
            <Controller
              name='password'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='New Password'
                  type={isPasswordShown ? 'text' : 'password'}
                  disabled={isLoading}
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState && setErrorState(null)
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={handleClickShowPassword}
                          onMouseDown={e => e.preventDefault()}
                          aria-label='toggle password visibility'
                        >
                          <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  {...(errors.password && { error: true, helperText: errors.password.message })}
                />
              )}
            />
            <Controller
              name='confirmPassword'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label='Confirm New Password'
                  type={isConfirmPasswordShown ? 'text' : 'password'}
                  disabled={isLoading}
                  onChange={e => {
                    field.onChange(e.target.value)
                    errorState && setErrorState(null)
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={handleClickShowConfirmPassword}
                          onMouseDown={e => e.preventDefault()}
                          aria-label='toggle password visibility'
                        >
                          <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  {...(errors.confirmPassword && {
                    error: true,
                    helperText: errors.confirmPassword.message || (field.value && watchedPassword !== field.value ? "Passwords don't match" : '')
                  })}
                />
              )}
            />
            <Button
              fullWidth
              variant='contained'
              type='submit'
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Resetting...' : 'Set New Password'}
            </Button>
            <Typography className='flex justify-center items-center' color='primary'>
              <Link
                href={getLocalizedUrl('/login', locale as Locale)}
                className='flex items-center gap-1.5'
              >
                <DirectionalIcon
                  ltrIconClass='ri-arrow-left-s-line'
                  rtlIconClass='ri-arrow-right-s-line'
                  className='text-xl'
                />
                <span>Back to Login</span>
              </Link>
            </Typography>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordV2
